# PINGR Development Database Server Deployment

This document describes the steps involved in setting up a PINGR development database server.   The process has been tested on a system running Windows 8.1, and is assumed to be compatible with subsequent versions of Windows. 

## 1. Install SQL Server 2008

On first run, the installer may complain that 'This program has compatibility issues'. On Windows 8.1 this is due to .NET Framework 3.5 being absent. Click 'Run the program without getting help' and you should then be able to install the missing dependency. Afterwards, you might need to re-run setup.exe

In the SQL Server Installation Center 

 * Click the 'Installation' tab on the left hand side
 * Click 'New SQL Server stand-alone installation'
 * Select all program instance options
 * Accept the default instance settings
 * In Server Configuration settings, select the account 'NT AUTHORITY\NETWORK SERVICE' for all the various services to run under (this account has minimal privileges, no password required)
 * Leave remaining options as the defaults

## 2. Install other apps/tools

### Git

Install Git for Windows (https://gitforwindows.org) with the following options: 

 * Adjusting PATH environment variable - select 'Use Git from Windows Command Prompt' to allow Git in bash or the command prompt 
 * HTTPS - Use the native Windows Secure Channel Library as the HTTPS transport backend
 * Line endings - select 'Checkout Windows-style, commit Unix-style line endings'
 * Terminal emulation - select 'Use MinTTY'
 * Accept the defaults for the remaining options

### NodeJs

Install NVM for Windows (https://github.com/coreybutler/nvm-windows) first. **NOTE** don't install in a path containing spaces! A sensible installation dir is C:\nvm
		
Use this to install nodejs / npm Open an Administrator command prompt to install the most recent version of node 8:

```
nvm install 8.11.3
nvm use 8.11.3
```

### MongoDB

MongoDB is only required for the Import/Export tools. 

 * For Windows 8.1, first install the Microsoft Visual C++ 2015 Redistributable (x64) - 14.0.23026 (https://www.microsoft.com/en-us/download/confirmation.aspx?id=48145)
 * Download the MongoDB installer for the correct version (currently 3.6.6)
 * Accept all installer defaults
 * Add the mongo bin directory to the system path

### Windows build tools    

This can be done very simply using npm. Open an admin command prompt and enter:

```
npm install --global --production windows-build-tools
```

### Other tools

The following apps/tools can be installed accepting the system defaults:

 * Chrome
 * 7zip 
 * Notepad++
 * Strawberry Perl

## 3. Build PINGR deployment code

 * Create the directory C:\Development 
 * Start a Git bash shell from that location
 * Checkout the PINGR source from git and build the appserver code:

```
git clone git@github.com:rw251/pingr.git
cd pingr/deploy/appserver
npm install
```

* Next build the testserver code:

```
cd ../testserver
git clone https://github.com/rw251/research-events-medication-htn.git
cd research-events-medication-htn
npm install
```

## 4. Install the database

### 4a. Prepare data to be imported

 * Create the directory C:\tempdata
 * Copy the .dat files to C:\tempdata

### 4b. Clone the importer code

 * Add appropriate ssh keys to you local user account, if not already setup
 * Checkout the code:

```
cd C:\Development
git clone git@bitbucket.org:rwilliams251/smash-data.git
```

 * Run the import script (FIXME: update the name!):

```	
cd C:\Development\smash-data\Batches
new_pingr_specific_script.bat
```
	
### 4c. Load the stored procedures

FIXME: The UpdateDates stored procedure needs to be included in the repository and loaded as part of thus step

```
cd C:\Development\pingr\deploy\dbserver
load_Stored_Procedures.bat
```

### 4d. Run the UpdateDates stored procedure to shift date window to present date

This stored procedure can be triggered manually using SQL Sever Management Studio. It will take at least 20 mins to complete. 

### 4e. Run PINGR testserver deploy scripts: 

 * Open a command prompt
 * Export the correct connection settings for the PINGR dev db:

```
SET PINGR_MONGO_DEV_USER=xxx
SET PINGR_MONGO_DEV_PASSWORD=yyy
```

 * Run the deploy scripts:
	
```
cd C:\Development\pingr\deploy\testserver
0.UpdateMedicationEvents.bat
1.RunAllStoredProcedure.bat
2.ExtractData.bat
3.ProcessData.bat
4.UploadToDevServer.bat
```

