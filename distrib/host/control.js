/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var RobOS;
(function (RobOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            //Get a global reference to the User Code Input (upi)
            _UserCodeTextArea = document.getElementById("taProgramInput");
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            RobOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSingleStepOn").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new RobOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Memory = new RobOS.Memory();
            _Memory.init();
            _MemoryAccessor = new RobOS.MemoryAccessor();
            _Disk = new RobOS.Disk();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(RobOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new RobOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        static hostBtnSingleStepOn_click(btn) {
            //turn single step on
            _SingleStep = true;
            btn.disabled = true;
            //Enable the single step off button
            //Allow for single step to be turned off
            document.getElementById("btnSingleStepOff").disabled = false;
            //enable Next Step button
            document.getElementById("btnNextStep").disabled = false;
        }
        static hostBtnSingleStepOff_click(btn) {
            //turn single step off
            _SingleStep = false;
            btn.disabled = true;
            _CPU.isExecuting = true;
            //enable Single Step On button
            document.getElementById("btnSingleStepOn").disabled = false;
            //disable Next Step button
            document.getElementById("btnNextStep").disabled = true;
        }
        //UPDATE THE TABLES//
        static hostBtnNextStep_click(btn) {
            //Go to next step by turning to true
            _NextStep = true;
            _CPU.isExecuting = true;
        }
        static memoryTbUpdate() {
            var entered;
            var next;
            var nextNum;
            var m = 0;
            var len = _Memory.memoryArr.length;
            this.clearMemoryTb();
            for (m = 0; m < len; m++) {
                entered = document.getElementById("memory" + m);
                entered.innerHTML = _Memory.memoryArr[m];
                //nextNum = (m + 1);
                //next = document.getElementById("memory" + nextNum);
                if (currentPCB == null) {
                    entered.style.backgroundColor = 'white';
                }
                else if (entered.innerHTML == currentPCB.IR && m == currentPCB.PC + _Memory.getSectMin(currentPCB.section)) {
                    entered.style.backgroundColor = '#6a9beb';
                }
                else if (m == (currentPCB.PC + _Memory.getSectMin(currentPCB.section) + 1)) {
                    entered.style.backgroundColor = '#ed5353';
                }
                else {
                    entered.style.backgroundColor = 'white';
                    //next.style.backgroundColor = 'white';
                }
            }
        }
        static clearMemoryTb() {
            var m = 0;
            var len = _Memory.memoryArr.length;
            for (m = 0; m < len; m++) {
                var entered = document.getElementById("memory" + m);
                entered.innerHTML = "00";
            }
        }
        static cpuTbUpdate() {
            if (_CPU.isExecuting) {
                var cpuPC = document.getElementById("cpuPC");
                cpuPC.innerHTML = _CPU.PC.toString();
                var cpuIR = document.getElementById("cpuIR");
                cpuIR.innerHTML = _CPU.IR;
                var cpuACC = document.getElementById("cpuACC");
                cpuACC.innerHTML = _CPU.ACC.toString(16).toUpperCase();
                var cpuX = document.getElementById("cpuX");
                cpuX.innerHTML = _CPU.Xreg.toString(16).toUpperCase();
                var cpuY = document.getElementById("cpuY");
                cpuY.innerHTML = _CPU.Yreg.toString(16).toUpperCase();
                var cpuZ = document.getElementById("cpuZ");
                cpuZ.innerHTML = _CPU.Zflag.toString(16).toUpperCase();
            }
            else {
                this.clearCPUTb();
            }
        }
        static clearCPUTb() {
            var cpuPC = document.getElementById("cpuPC");
            cpuPC.innerHTML = "0";
            var cpuIR = document.getElementById("cpuIR");
            cpuIR.innerHTML = "0";
            var cpuACC = document.getElementById("cpuACC");
            cpuACC.innerHTML = "0";
            var cpuX = document.getElementById("cpuX");
            cpuX.innerHTML = "0";
            var cpuY = document.getElementById("cpuY");
            cpuY.innerHTML = "0";
            var cpuZ = document.getElementById("cpuZ");
            cpuZ.innerHTML = "0";
        }
        static proccessesTbUpdate() {
            this.clearProcessesTb();
            var tbProcesses = document.getElementById("tbProcesses");
            for (var p = 0; p < PCBList.length; p++) {
                //insert row for each process
                var row = tbProcesses.insertRow(p + 1);
                var processesPID = row.insertCell(0);
                processesPID.innerHTML = PCBList[p].PID.toString(16).toUpperCase();
                var processesPC = row.insertCell(1);
                processesPC.innerHTML = PCBList[p].PC.toString(16).toUpperCase();
                var processesIR = row.insertCell(2);
                processesIR.innerHTML = PCBList[p].IR;
                var processesACC = row.insertCell(3);
                processesACC.innerHTML = PCBList[p].ACC.toString(16).toUpperCase();
                var processesX = row.insertCell(4);
                processesX.innerHTML = PCBList[p].Xreg.toString(16).toUpperCase();
                var processesY = row.insertCell(5);
                processesY.innerHTML = PCBList[p].Yreg.toString(16).toUpperCase();
                var processesZ = row.insertCell(6);
                processesZ.innerHTML = PCBList[p].Zflag.toString(16).toUpperCase();
                var processesState = row.insertCell(7);
                processesState.innerHTML = PCBList[p].state;
                var processesLocation = row.insertCell(8);
                processesLocation.innerHTML = PCBList[p].location;
            }
        }
        static clearProcessesTb() {
            var tbProcesses = document.getElementById("tbProcesses");
            // delete each row
            for (var i = tbProcesses.rows.length; i > 1; i--) {
                tbProcesses.deleteRow(i - 1);
            }
        }
        static diskTbUpdate() {
            //First clear the table
            this.clearDiskTb();
            //Load the table
            var diskTb = document.getElementById("tbDisk");
            //Store the data in an Array
            var dataArr;
            //INITALIZE HEADER ROW//
            var headerRow = diskTb.insertRow(0);
            headerRow.style.fontWeight = "bold";
            //CELLS//
            //TSB
            var tsb = headerRow.insertCell(0);
            tsb.innerHTML = "T:S:B";
            //Used
            var used = headerRow.insertCell(1);
            used.innerHTML = "Used";
            //Next
            var next = headerRow.insertCell(2);
            next.innerHTML = "Next";
            //Data
            var data = headerRow.insertCell(3);
            data.innerHTML = "Data";
            //DATA ROWS//
            //Rows starting at 1
            var rowNum = 1;
            //Track, Sector, Block for loops to set up using the HTML5 Session Storage
            for (var x = 0; x < _Disk.tracks; x++) {
                for (var y = 0; y < _Disk.sectors; y++) {
                    for (var z = 0; z < _Disk.blocks; z++) {
                        dataArr = sessionStorage.getItem(x + ":" + y + ":" + z).split(",");
                        //INITALIZE DATA ROW//
                        var dataRow = diskTb.insertRow(rowNum);
                        //CELLS//
                        //TSB
                        var tsb = dataRow.insertCell(0);
                        tsb.innerHTML = x + ":" + y + ":" + z;
                        //Used
                        var used = dataRow.insertCell(1);
                        used.innerHTML = dataArr[0].valueOf();
                        //Next
                        var next = dataRow.insertCell(2);
                        next.innerHTML = dataArr[1] + ":" + dataArr[2] + ":" + dataArr[3];
                        //Data
                        var data = dataRow.insertCell(3);
                        var dataStr = new String();
                        for (var j = 4; j < dataArr.length; j++) {
                            dataStr += dataArr[j].valueOf();
                        }
                        data.innerHTML = dataStr.valueOf();
                        rowNum++; //increment to the next row number
                    }
                }
            }
        }
        static clearDiskTb() {
            var diskTb = document.getElementById("tbDisk");
            //delete the rows
            for (var i = 1; i < diskTb.rows.length;) {
                diskTb.deleteRow(i);
            }
        }
        static updateAllTables() {
            this.clearMemoryTb();
            this.clearCPUTb();
            this.clearProcessesTb();
            this.clearDiskTb();
            this.memoryTbUpdate();
            this.cpuTbUpdate();
            this.proccessesTbUpdate();
            if (_DiskFormatted) {
                this.diskTbUpdate();
            }
        }
    }
    RobOS.Control = Control;
})(RobOS || (RobOS = {}));
//# sourceMappingURL=control.js.map