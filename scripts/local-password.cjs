'use strict';
const readline = require('node:readline');
function passwordPrompt() {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) return reject(new Error('Use um terminal local interativo. A senha não é aceita por argumentos, arquivo ou pipeline.'));
    let password = '';
    readline.emitKeypressEvents(process.stdin);
    const previousRaw = Boolean(process.stdin.isRaw);
    process.stdin.setRawMode(true); process.stdin.resume();
    process.stdout.write('Senha do PostgreSQL local (entrada oculta): ');
    function finish() { process.stdin.removeListener('keypress', keypress); process.stdin.setRawMode(previousRaw); process.stdin.pause(); process.stdout.write('\n'); }
    function keypress(text, key = {}) {
      if (key.ctrl && key.name === 'c') { password = ''; finish(); reject(new Error('Operação cancelada.')); }
      else if (key.name === 'return' || key.name === 'enter') { finish(); if (!password) reject(new Error('Senha não informada.')); else resolve(password); }
      else if (key.name === 'backspace') password = password.slice(0, -1);
      else if (text && !key.ctrl && !key.meta && !/[\x00-\x1f\x7f]/.test(text)) password += text;
    }
    process.stdin.on('keypress', keypress);
  });
}
module.exports = { passwordPrompt };
