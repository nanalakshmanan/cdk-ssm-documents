import { AsyncRunner } from './async-runner';
const PythonShell = require('python-shell').PythonShell;

/**
 * Runs the Python execution and returns a promise with the Python result.
 * This is used with SynchronousPromise to wait for the result from the Python execution synchronously.
 */
export class PythonAsyncRunner implements AsyncRunner {

    /**
     * Expect args to be a list with 3 values:
     * 1. The path of the python script.
     * 2. The function name to execute in the above script.
     * 3. The arguments to deliver to the above function.
     */
    runAsync(args: any[]): Promise<any> {
        return new Promise(function (resolve: any, _reject: any) {
            const pythonOut = new Promise(function (resolve: any, _reject: any) {
                var options = {
                    mode: 'text',
                    pythonOptions: ['-u'],
                    scriptPath: __dirname + "/../",
                    args: [args[0], args[1], JSON.stringify(args[2])]
                };
    
                // See documentation in pythonScriptEntry.py to see how this execution works.
                PythonShell.run("pythonScriptEntry.py", options, function (err: any, results: any) {
                    if (err != undefined) {
                        console.log("Error calling python: " + JSON.stringify(err));
                        resolve(err);
                    }
                    // Results is an array consisting of messages collected during execution
                    // Pop the last one (which is the function repsonse written out by pythonScriptEntry.py)
                    const endResult: string = results.pop();
                    // The results are wrapped with Payload (as is done in SSM) as well as status (SUCCESS|FAILURE)
                    resolve(JSON.parse(endResult))
                });
            });
            pythonOut.then(function(data: any) {
                resolve(data);
            }).catch(function(err: any) {
                resolve({"status": "FAILURE", "Payload": err});
            });
        });
    }

}