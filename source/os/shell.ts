/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module RobOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            
            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                "whereami",
                "- Tells you where you are on Earth.");
            this.commandList[this.commandList.length] = sc;

            // loz
            sc = new ShellCommand(this.shellLoz,
                "loz",
                "- Displays triforce text art...");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Sets your preferred status.");
            this.commandList[this.commandList.length] = sc;
            
            // bsod
            sc= new ShellCommand(this.shellBSOD,
                "bsod",
                "- Displays a BSOD message.");
            this.commandList[this.commandList.length] = sc;
            
            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Load UPI into memory for execution.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "<pid> - Runs a program already loaded in memory.");
            this.commandList[this.commandList.length] = sc;
            
            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- Execute all programs at once.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clear all memory partitions.");
                 this.commandList[this.commandList.length] = sc;
           
            // ps  - list the running processes and their IDs
            sc = new ShellCommand(this.shellPS,
                "ps",
                "- Display the PID and state of all processes.");
            this.commandList[this.commandList.length] = sc;
            
            // kill <id> - kills the specified process id.
            sc = new ShellCommand(this.shellKill,
                "kill",
                "<pid> - Kill one process.");
            this.commandList[this.commandList.length] = sc;
            
            // killall
            sc = new ShellCommand(this.shellKillAll,
                "killall",
                "- Kill all processes.");
            this.commandList[this.commandList.length] = sc;
            
            // quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "<int> - Sets the RR (Round Robin) quantum.");
            this.commandList[this.commandList.length] = sc;
            
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while(!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if(found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if(this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if(this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for(var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if(_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if(_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for(var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if(args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("The current version of RobOS.")
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down RobOS, but leaves the underlying host / hardware simulation running.")
                        break;
                    case "cls":
                        _StdOut.putText("Clears the entire screen.  Resets cursor to the left side of the screen.")
                        break;
                    case "man":
                        _StdOut.putText(" The manual. That thing you're reading. duh.")
                        break;
                    case "trace":
                        _StdOut.putText("Turns the OS trace on or off.")
                        break;
                    case "rot13":
                        _StdOut.putText("Does rot13 obfuscation on <string>.")
                        break;
                    case "prompt":
                        _StdOut.putText("Sets the prompt.")
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "date":
                        _StdOut.putText("Tells date and time.  Or look at your watch.")
                        break;
                    case "whereami":
                        _StdOut.putText("If you don't know where you are, I definitely don't")
                        break;
                    case "loz":
                        _StdOut.putText("The Legend of Zelda ... ya know, the game series?")
                        break;
                    case "status":
                        _StdOut.putText("Displays your status in the task bar above.");
                        break;
                    case "bsod":
                        _StdOut.putText("Test BSOD message.");
                        break;
                    case "load":
                        _StdOut.putText("Load the UPI (User Program Input) into memory for execution.");
                        break;
                    case "run":
                        _StdOut.putText("Runs a program that's already loaded into memory.");
                        break;
                    case "runall":
                        _StdOut.putText("Execute all programs at once.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clear all memory partitions.");
                        break;
                    case "ps":
                        _StdOut.putText("Display the PID and state of all processes.");
                        break;
                    case "kill":
                        _StdOut.putText("Kill a specified process in memory.");
                        break;
                    case "killall":
                        _StdOut.putText("Kill all processes in memory.");
                        break;
                    case "quantum":
                        _StdOut.putText("Lets the user set the RR (Round Robin) quantum (measured in cpu cycles).");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if(args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if(args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if(args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
           _StdOut.putText("Date: " + today);
        }

        public shellWhereami(args: string[]){
            _StdOut.putText("https://earth.google.com/web/");
        }

        public shellLoz(args: string[]){
            _StdOut.putText("          / \\          "); _StdOut.advanceLine();
            _StdOut.putText("         /   \\         "); _StdOut.advanceLine();
            _StdOut.putText("        /     \\        "); _StdOut.advanceLine();
            _StdOut.putText("       /       \\       "); _StdOut.advanceLine();
            _StdOut.putText("      /_________\\      "); _StdOut.advanceLine();
            _StdOut.putText("     /\\        /\\     "); _StdOut.advanceLine();
            _StdOut.putText("    /  \\      /  \\    "); _StdOut.advanceLine();
            _StdOut.putText("   /    \\    /    \\   "); _StdOut.advanceLine();
            _StdOut.putText("  /      \\  /      \\  "); _StdOut.advanceLine();
            _StdOut.putText(" /________\\/________\\ ");
        }

        public shellStatus(args: string[]){
            if (args.length > 0 && !null) {
                var statusIn = document.getElementById("statusIn").innerText = "Status: " + args.join(" ");
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string status update.");
            }
        }
        public shellBSOD(args: string[]){
            _StdOut.putText("WARNING:"); _StdOut.advanceLine();
            _StdOut.putText("Because of something you did,"); _StdOut.advanceLine();
            _StdOut.putText("RobOS is highly unstable"); _StdOut.advanceLine();
            _StdOut.putText("You can try to restore RobOS,"); _StdOut.advanceLine();
            _StdOut.putText("although that probably won't work,"); _StdOut.advanceLine();
            _StdOut.putText("or restart your stupid computer."); _StdOut.advanceLine();
            _StdOut.advanceLine();
            _StdOut.putText("CHOOSE FROM THE FOLLOWING:"); _StdOut.advanceLine();
            _StdOut.putText("Sacrifice something to Robbie"); _StdOut.advanceLine();
            _StdOut.putText("and hope he takes pity on you."); _StdOut.advanceLine();
            _Kernel.krnShutdown();
        }
        public shellLoad(args: string[]){
            var valid = true;
            //Valid hex values to make program
            var validHex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
            var validOPCodes = ['A9', 'AD', '8D', '6D', 'A2', 'AE', 'A0', 'AC', 'EA', '00', 'EC', 'D0', 'EE', 'FF'];
            //User Program Input
            _UserCodeTextArea = document.getElementById("taProgramInput");
            var upi = _UserCodeTextArea.value;
            //Split at Space into array
            upi = upi.toUpperCase();
            
            var hexChrArr = upi.split('');
            var OPCodeArr = upi.split(' ');
            
            upi = upi.replace(/\s/g, '');

            //Checks for only hex characters
            for(var i = 0; i < upi.length; i++) {
                //Check if each character is in array
                if(validHex.indexOf(upi[i]) == -1) {
                    _StdOut.putText("LOAD ERROR: - Please only enter valid hex characters (0-9, a-z, and A-Z).");
                    _StdOut.advanceLine();
                    _StdOut.putText("INVALID CHARACTER: " + upi[i]);
                    _StdOut.advanceLine();
                    
                    valid = false;
                }
            }
            //TODO: Validate OP Codes
            
            //Loading Program
            if(valid == true){
                //_PID initialized in globals.ts
                //_StdOut.putText("Entered hex OP codes are valid.");
                //_StdOut.advanceLine();
                if(_MemoryManager.checkMemoryAvailability()) {
                    var pcb = new RobOS.PCB();
                    pcb.PID = _PID;
                    //currentPCB = pcb;
                    pcb.location = "Memory";
                    pcb.state = "Waiting";
                    
                    //Assign to memory section
                    pcb.section = _MemoryManager.assignMemory();
                    PCBList[PCBList.length] = pcb;
                    residentPCB[residentPCB.length] = pcb;

                    //Load Memory
                    _MemoryManager.loadMemory(OPCodeArr, pcb.section, pcb.PID);
                    //Update PCB's IR
                    pcb.IR = _MemoryAccessor.readMemoryHex(pcb.section, pcb.PC);
                    
                    //Update the Memory Table
                    RobOS.Control.memoryTbUpdate();
                    //Update the Processes Table
                    RobOS.Control.proccessesTbUpdate();

                    //Program successfully loaded
                    _StdOut.putText("Program loaded.");
                    _StdOut.advanceLine();
                    _StdOut.putText("PID: " + pcb.PID);
                    //_StdOut.putText(upi); //print user program input to debug/validate
                    //Increment PID
                    _PID++;
                }
                else {
                    _StdOut.putText("Memory is full.");
                }
            }
        }
        public shellRun(args: String[]) {
            //Check that arg is not empty and is a number
            if(args.length > 0 && (!isNaN(Number(args[0])))){
                var enteredPID = Number(args[0]);
                //check if PID is loaded in memory
                
                if(_MemoryManager.checkPCBisResident(enteredPID)){
                    PCBList[_MemoryManager.getIndex(PCBList, enteredPID)].state = "Ready";
                    //RobOS.Control.proccessesTbUpdate();

                    readyPCBQueue[readyPCBQueue.length] = _MemoryManager.getPCB(enteredPID);
                    currentPCB = _MemoryManager.getPCB(enteredPID);
                    _CPU.isExecuting = true;
                    RobOS.Control.updateAllTables();
                }else {
                    _StdOut.putText("Please enter a valid PID number.");
                }
            } else {
                _StdOut.putText("Please put a number for the PID.");
            }
        }
        public shellRunAll(args: String[]) {
            if(residentPCB.length == 0) {
                _StdOut.putText("There are no processes in memory to run.");
                return;
            } else {
                //Turn all processes from waiting to ready
               for(var i = 0; i < residentPCB.length; i+=0) {
                    if(residentPCB[i].state == "Waiting") {
                        residentPCB[i].state = "Ready";
                        readyPCBQueue[readyPCBQueue.length] = residentPCB[i];
                        residentPCB.splice(i, 1);
                    }
                }
                if(!_CPU.isExecuting) {
                    _CPU.init();
                    currentPCB = readyPCBQueue[0];
                    if(_SingleStep == true) {
                        _CPU.isExecuting = false;
                    } else{
                        _CPU.isExecuting = true;
                    }
                    RobOS.Control.updateAllTables();
                }
            }
        }
        public shellClearMem(args: String[]) {
            if(!_CPU.isExecuting){
                //Clear PCB list and queue, then clear memory which updates tables
                PCBList = [];
                readyPCBQueue = [];
                residentPCB = [];
                var section = "all";
                _MemoryManager.clearMem(section);
                RobOS.Control.memoryTbUpdate();
            } else {
                _StdOut.putText("HALT: Memory can only be cleared when there are no programs being executed.");
            }
        }
        public shellPS(args: String[]) {
            if(PCBList.length > 0) {
                for(var i = 0; i < PCBList.length; i++) {
                    _StdOut.putText("PID: " + PCBList[i].PID + " | State: " + PCBList[i].state);
                    _StdOut.advanceLine();
                }
            }
            else {
                _StdOut.putText("There are currently no processes in memory.");
            }
        }
        public shellKill(args: String[]) {
            if(args.length > 0 && (!isNaN(Number(args[0])))) {
                var enteredPID = Number(args[0]);
                //Check if PCB is resident
                if(_MemoryManager.checkPCBisResident(enteredPID)) {
                    _StdOut.putText("Process " + enteredPID + ": Terminated");
                    
                    //if current PCB is not null and PID is equal to the entered PID
                    if(currentPCB != null && currentPCB.PID == enteredPID) {
                        currentPCB = null; //set currentPCB to null
                    }

                    //Get PCB section by enteredPID and clear section
                    var section = _MemoryManager.getPCB(enteredPID).section;
                    _MemoryManager.clearMem(section);
                    
                    //Get index in the PCBList by enteredPID and remove that section from PCBList
                    var indexPCBList = _MemoryManager.getIndex(PCBList, enteredPID);
                    PCBList.splice(indexPCBList, 1);
                    
                    //Get index in the residentPCB list
                    var indexResidentPCB = _MemoryManager.getIndex(residentPCB, enteredPID);
                    residentPCB.splice(indexResidentPCB, 1);
                    
                    //check if PCB is in the ready queue and remove it from the readyPCBQueue
                    if(_MemoryManager.checkPCBinReadyQueue(enteredPID)) {
                        var indexPCBReadyQueue = _MemoryManager.getIndex(readyPCBQueue, enteredPID);
                        readyPCBQueue.splice(indexPCBReadyQueue, 1);
                    }
                    //Update Tables
                    RobOS.Control.updateAllTables();
                } else {
                    _StdOut.putText("Please enter a valid PID number that is in memory.");
                }
            } else {
                _StdOut.putText("Please enter a PID number.");
            }
        }
        public shellKillAll(args: String[]) {
            //Stop CPU
            _CPU.isExecuting = false;
            //Let user know which processes are being terminated
            for(var i = 0; i < PCBList.length; i++) {
                _StdOut.putText("Process " + PCBList[i].PID + ": Terminated");
                _StdOut.advanceLine();
            }
            //clear all memory partitions/sections and update tables
            _MemoryManager.clearMem("all");
            //Clear all lists
            PCBList = [];
            readyPCBQueue = [];
            residentPCB = [];
            //set currentPCB to null
            currentPCB = null;
            RobOS.Control.updateAllTables();
        }
        public shellQuantum(args: String[]) {
            //Check if quantum is valid
            if(args.length > 0 && !(isNaN(Number(args[0])))) {
                var enteredQuantum = Number(args[0]);
                if(enteredQuantum > 0) {
                    _Quantum = enteredQuantum;
                } else {
                    _StdOut.putText("Please enter a quantum greater than 0.");
                }
            } else {
                _StdOut.putText("Please enter a valid quantum.");
            }
        }
    }
}