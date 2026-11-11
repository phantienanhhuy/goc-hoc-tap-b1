import { createClient as createSupabaseClient } from './vendor/supabase.js';
import { CLOUD_CONFIG } from './cloud-config.js';

const PAGE_SIZE = 500;
const MAX_ROWS = 30000;

function validKey(key) {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
  if (key.startsWith('sb_secret_')) return false;
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return false;
    const body = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(body)).role === 'anon';
  } catch { return false; }
}

function validate(config) {
  if (!config?.supabaseUrl && !config?.publishableKey) return 'Chưa cấu hình đồng bộ đám mây.';
  try {
    const url = new URL(config.supabaseUrl);
    if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) throw new Error();
    const site = new URL(config.siteUrl);
    if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash) throw new Error();
    if (!validKey(config.publishableKey)) throw new Error();
  } catch { return 'Cấu hình đồng bộ đám mây không hợp lệ.'; }
  return null;
}

// Errors are deliberately generic: server responses can contain sensitive information.
function resultData(result, message) {
  if (result?.error) throw new Error(message);
  return result?.data;
}

export function createCloudClient(config = CLOUD_CONFIG, options = {}) {
  const configError = validate(config);
  const configured = !configError;
  const factory = options.createClient || createSupabaseClient;
  let sdk;
  let authGeneration = 0;
  if (configured) {
    const project = new URL(config.supabaseUrl).hostname.split('.')[0];
    const site = new URL(config.siteUrl);
    const scope = encodeURIComponent(`${site.hostname}${site.pathname}`);
    sdk = factory(config.supabaseUrl, config.publishableKey, {
      auth: { flowType: 'pkce', autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, storageKey: `b1-${project}-${scope}-auth` }
    });
    // Synchronous only: Supabase callbacks run under its auth lock.
    sdk.auth?.onAuthStateChange?.(() => { authGeneration++; });
  }
  const requireClient = () => {
    if (!sdk) throw new Error(configError);
    return sdk;
  };
  const getSession = async () => resultData(await requireClient().auth.getSession(), 'Không thể kiểm tra phiên đăng nhập.')?.session || null;
  const checkUser = async userId => {
    const session = await getSession();
    if (!userId || session?.user?.id !== userId || typeof session.access_token !== 'string' || !session.access_token) throw new Error('Tài khoản đăng nhập đã thay đổi. Vui lòng thử lại.');
    return session;
  };
  // Never let the shared client's mutable auth state select a different account's
  // token after the account check. RLS authorizes the captured token server-side.
  const requestClient = async userId => {
    const session = await checkUser(userId);
    const token = session.access_token;
    return factory(config.supabaseUrl, config.publishableKey, { accessToken: async () => token });
  };
  const timed = async query => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try { return await query.abortSignal(controller.signal); } finally { clearTimeout(timer); }
  };
  return {
    configured, configError, getSession,
    onAuthStateChange(callback) {
      const { data } = requireClient().auth.onAuthStateChange((event, session) => callback(event, session));
      return () => data.subscription.unsubscribe();
    },
    async signIn(email, password) {
      return resultData(await requireClient().auth.signInWithPassword({ email, password }), 'Không thể đăng nhập. Hãy kiểm tra email và mật khẩu.');
    },
    async signUp(email, password) {
      return resultData(await requireClient().auth.signUp({ email, password, options: { emailRedirectTo: config.siteUrl } }), 'Không thể tạo tài khoản. Vui lòng thử lại.');
    },
    async signOut() { resultData(await requireClient().auth.signOut(), 'Không thể đăng xuất. Vui lòng thử lại.'); },
    async sendPasswordReset(email) {
      return resultData(await requireClient().auth.resetPasswordForEmail(email, { redirectTo: config.siteUrl }), 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.');
    },
    async updatePassword(password) {
      return resultData(await requireClient().auth.updateUser({ password }), 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    },
    transportFor(userId) {
      let cache = null;
      const revision = async () => {
        const client = await requestClient(userId);
        const result = await timed(client.rpc('get_study_revision'));
        await checkUser(userId);
        const value = resultData(result, 'Không thể kiểm tra dữ liệu đám mây. Vui lòng thử lại.');
        if (!Number.isSafeInteger(value) || value < 0) throw new Error('Phiên bản dữ liệu đám mây không hợp lệ.');
        return value;
      };
      return {
        async readAll() {
          for (let attempt = 0; attempt < 3; attempt++) {
            const session = await checkUser(userId);
            const generation = authGeneration;
            const before = await revision();
            const current = await checkUser(userId);
            if (generation !== authGeneration || session.access_token !== current.access_token) { cache = null; continue; }
            if (cache && cache.revision === before && cache.generation === generation && cache.token === current.access_token) return structuredClone(cache.rows);
            cache = null;
            const rows = [];
            let complete = false;
            for (let offset = 0; offset <= MAX_ROWS; offset += PAGE_SIZE) {
              const client = await requestClient(userId);
              const query = client.from('study_records').select('*').order('collection').order('key').range(offset, offset + PAGE_SIZE - 1);
              const result = await timed(query);
              await checkUser(userId);
              const page = resultData(result, 'Không thể tải dữ liệu đám mây. Vui lòng thử lại.');
              if (!Array.isArray(page)) throw new Error('Dữ liệu đám mây không hợp lệ.');
              if (offset === MAX_ROWS && page.length) throw new Error('Dữ liệu đám mây vượt giới hạn tải an toàn.');
              rows.push(...page);
              if (page.length < PAGE_SIZE) { complete = true; break; }
            }
            if (!complete) throw new Error('Dữ liệu đám mây vượt giới hạn tải an toàn.');
            const after = await revision();
            const finalSession = await checkUser(userId);
            if (before === after && generation === authGeneration && session.access_token === finalSession.access_token) {
              cache = { revision: after, rows: structuredClone(rows), generation, token: finalSession.access_token };
              return structuredClone(rows);
            }
          }
          throw new Error('Dữ liệu đang thay đổi. Vui lòng thử đồng bộ lại.');
        },
        async apply(changes) {
          cache = null;
          const client = await requestClient(userId);
          const result = await timed(client.rpc('apply_study_changes', { p_changes: changes }));
          await checkUser(userId);
          const data = resultData(result, 'Không thể đồng bộ dữ liệu. Vui lòng thử lại.');
          if (!data || typeof data.ok !== 'boolean') throw new Error('Phản hồi đồng bộ không hợp lệ.');
          return data;
        },
        async backup(state) {
          const client = await requestClient(userId);
          const result = await timed(client.rpc('create_study_backup', { p_state: state, p_schema_version: 1 }));
          await checkUser(userId);
          const data = resultData(result, 'Không thể tạo bản sao lưu. Vui lòng thử lại.');
          if (!data || typeof data !== 'object') throw new Error('Phản hồi sao lưu không hợp lệ.');
          return data;
        },
        async listBackups() {
          const client = await requestClient(userId);
          const query = client.from('study_backups').select('id,created_at,schema_version').order('created_at', { ascending: false }).limit(10);
          const result = await timed(query);
          await checkUser(userId);
          const data = resultData(result, 'Không thể tải danh sách bản sao lưu. Vui lòng thử lại.');
          if (!Array.isArray(data)) throw new Error('Danh sách bản sao lưu không hợp lệ.');
          return data;
        },
        async getBackup(id) {
          if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Mã bản sao lưu không hợp lệ.');
          const client = await requestClient(userId);
          const query = client.from('study_backups').select('*').eq('id', id).single();
          const result = await timed(query);
          await checkUser(userId);
          const data = resultData(result, 'Không thể tải bản sao lưu. Vui lòng thử lại.');
          if (!data || typeof data !== 'object') throw new Error('Bản sao lưu không hợp lệ.');
          return data;
        }
      };
    }
  };
}
