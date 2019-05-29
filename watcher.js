const chokidar = require('chokidar');
const { execSync }  = require('child_process');


const run = () => {
  console.log('fabler is running...');
  try {
    execSync('node run-fabler.js', {stdio: 'inherit'});
  } catch(err) {}
}

run();
console.log('start file watcher');
// for src directory, ignores .dotfiles
chokidar.watch('src', {ignoreInitial: true, ignored: /(^|[\/\\])\../}).on('all', run);
