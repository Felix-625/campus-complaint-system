const crypto = require('crypto');

// Character set excluding visually ambiguous characters (0, O, 1, I)
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

const generateTrackingCode = () => {
  let code = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }
  return `CMP-${code}`;
};

module.exports = { generateTrackingCode };
