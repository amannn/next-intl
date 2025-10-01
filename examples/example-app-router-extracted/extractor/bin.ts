// import {extractAll, startWatcher} from './index.ts';

// const args = process.argv.slice(2);
// if (args.includes('--watch')) {
//   const watcher = await startWatcher();
//   console.log('👀 File watcher started');

//   function exit() {
//     watcher.stop();
//     process.exit(0);
//   }
//   process.on('SIGINT', exit);
//   process.on('SIGTERM', exit);
// } else {
//   await extractAll();
//   process.exit(0);
// }
