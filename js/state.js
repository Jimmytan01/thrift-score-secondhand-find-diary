export const DEFAULT_CATEGORIES = ['Clothing', 'Furniture', 'Books', 'Electronics', 'Art', 'Kitchenware'];

const text = (value) => String(value ?? '').trim();
const today = () => new Date().toISOString().slice(0, 10);
const numberOrNull = (value) => (value === '' || value == null ? null : Number(value));

export function validateFind(input = {}) {
  const errors = {};
  const name = text(input.name);
  const price = numberOrNull(input.price);
  const estimatedValue = numberOrNull(input.estimatedValue);
  if (!name) errors.name = 'Item name is required.';
  if (!Number.isFinite(price) || price < 0) errors.price = 'Enter a non-negative price.';
  if (estimatedValue !== null && (!Number.isFinite(estimatedValue) || estimatedValue < 0)) {
    errors.estimatedValue = 'Enter a non-negative estimated value.';
  }
  if (Object.keys(errors).length) return { valid: false, errors };
  return {
    valid: true,
    errors: {},
    value: {
      name,
      description: text(input.description),
      place: text(input.place),
      price,
      estimatedValue,
      category: text(input.category) || DEFAULT_CATEGORIES[0],
      foundDate: text(input.foundDate) || today(),
      photoUrl: text(input.photoUrl),
      emoji: text(input.emoji) || '✨'
    }
  };
}

const normalize = (find) => ({
  id: text(find.id) || crypto.randomUUID(),
  ...validateFind(find).value,
  createdAt: text(find.createdAt) || new Date().toISOString()
});

export function createStore(initialFinds = []) {
  let finds = initialFinds.map((find) => {
    const checked = validateFind(find);
    return checked.valid ? normalize(find) : null;
  }).filter(Boolean);
  let filter = 'All';
  return {
    getFinds: () => [...finds],
    getFilter: () => filter,
    getCategories: () => [...new Set([...DEFAULT_CATEGORIES, ...finds.map((find) => find.category)])],
    getFilteredFinds: () => filter === 'All' ? [...finds] : finds.filter((find) => find.category === filter),
    setFilter: (category) => { filter = category || 'All'; },
    add: (input) => {
      const checked = validateFind(input);
      if (!checked.valid) return checked;
      const find = { id: crypto.randomUUID(), ...checked.value, createdAt: new Date().toISOString() };
      finds = [find, ...finds];
      return { valid: true, errors: {}, value: find };
    },
    remove: (id) => { finds = finds.filter((find) => find.id !== id); },
    getStats: () => finds.reduce((stats, find) => ({
      totalItems: stats.totalItems + 1,
      totalSpent: stats.totalSpent + Number(find.price || 0),
      totalSavings: stats.totalSavings + (find.estimatedValue == null ? 0 : Number(find.estimatedValue) - Number(find.price || 0))
    }), { totalItems: 0, totalSpent: 0, totalSavings: 0 })
  };
}
