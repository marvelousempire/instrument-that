#!/usr/bin/env node
import {catalog,validateCatalog} from '../lib/receiver.mjs';
try {
 const args=process.argv.slice(2);
 if(args.length!==1||!['catalog','validate'].includes(args[0]))throw Error('Use catalog or validate. Invocation requires the registered owner admission adapter.');
 validateCatalog();process.stdout.write(JSON.stringify(args[0]==='catalog'?catalog():{ok:true,total:54,callable:46,unbound:8})+'\n');
}catch(error){process.stderr.write(error.message+'\n');process.exitCode=2;}
