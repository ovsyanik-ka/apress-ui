const chokidar = require('chokidar');
const fabler = require('./fabler');


const run = () => {
  console.log('fabler is running...');
  fabler();
}

run();
console.log('start file watcher');
// for src directory, ignores .dotfiles
chokidar.watch('src', {ignoreInitial: true, ignored: /(^|[\/\\])\../}).on('all', run);
