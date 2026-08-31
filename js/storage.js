const KEY = 'thrift-score-finds';

export function loadFinds(storage) {
  try {
    const raw = (storage || window.localStorage).getItem(KEY);
    if (!raw) return { finds: [], issue: null };
    const finds = JSON.parse(raw);
    if (!Array.isArray(finds)) throw new Error('Stored value was not an array');
    return { finds, issue: null };
  } catch (error) {
    console.warn('Thrift Score could not read saved finds.', error);
    return { finds: [], issue: 'Stored finds could not be read.' };
  }
}

export function saveFinds(finds, storage) {
  try {
    (storage || window.localStorage).setItem(KEY, JSON.stringify(finds));
    return { ok: true, issue: null };
  } catch (error) {
    console.warn('Thrift Score could not save finds.', error);
    return { ok: false, issue: 'Your finds could not be saved.' };
  }
}
