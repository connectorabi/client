
;Include Modern UI

!include "MUI2.nsh"
Icon "img\connector.ico"

Name "ConnectorAbi"

OutFile "connectorabi-setup.exe"

InstallDir "$APPDATA\ConnectorAbi"
;InstallDir "$PROGRAMFILES\ConnectorAbi"

InstallDirRegKey HKLM "Software\ConnectorAbi" "Install_Dir"


RequestExecutionLevel admin

;--------------------------------

; Pages

Page components
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

;--------------------------------

 
;-------------------------------- 
;Modern UI System
 
  ;;;!insertmacro MUI_SYSTEM
  
  !define MUI_PAGE_CUSTOMFUNCTION_LEAVE installServices
  !insertmacro MUI_PAGE_FINISH
  
  !insertmacro MUI_LANGUAGE "Turkish"
  !insertmacro MUI_LANGUAGE "English"

  


; The stuff to install
;Section "Connector Client (required)"
Section "install"

  SetOutPath $INSTDIR

  CreateDirectory "$INSTDIR\img"

  File /r "node.exe"
  File /r "nssm.exe"
  

  File /r /x ".env*" /x "installer" /x "docs"  /x ".*" "..\..\*.*"

  SetOutPath $INSTDIR\img
  File /r "img\*.ico"
  
  SetOutPath $INSTDIR
  
  WriteRegStr HKLM "Software\ConnectorAbi" "Install_Dir" "$INSTDIR"
  
  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorAbi" "DisplayName" "ConnectorAbi"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorAbi" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorAbi" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorAbi" "NoRepair" 1
  WriteUninstaller "uninstall.exe"
  
  CreateDirectory "$SMPROGRAMS\ConnectorAbi\"
  CreateShortcut "$SMPROGRAMS\ConnectorAbi\Connector Start.lnk" "$INSTDIR\node.exe" "cli.js start" "$INSTDIR\img\database.ico"
  CreateShortcut "$SMPROGRAMS\ConnectorAbi\Client User Information.lnk" "$INSTDIR\node.exe" "cli.js show" "$INSTDIR\img\connector.ico"
  CreateShortcut "$SMPROGRAMS\ConnectorAbi\Renew Password.lnk" "$INSTDIR\node.exe" "cli.js renewpass" "$INSTDIR\img\shield.ico"
  CreateShortcut "$SMPROGRAMS\ConnectorAbi\Uninstall.lnk" "$INSTDIR\uninstall.exe"
  ;create desktop shortcut
  CreateShortCut "$DESKTOP\ConnectorAbi.lnk" "$INSTDIR\node.exe" "cli.js show" "$INSTDIR\img\connector.ico"

SectionEnd


Section "Uninstall"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorAbi"
  DeleteRegKey HKLM "SOFTWARE\ConnectorAbi"

  ExpandEnvStrings $0 %COMSPEC%
  ExecWait '"$INSTDIR\nssm.exe" stop "ConnectorAbi"'
  ExecWait '"$INSTDIR\nssm.exe" remove "ConnectorAbi" confirm'


  Delete $INSTDIR\*.*

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\ConnectorAbi\*.*"
  Delete "$DESKTOP\ConnectorAbi.lnk"

  ; Remove directories used
  RMDir "$SMPROGRAMS\ConnectorAbi"
  RMDir /r "$INSTDIR"

SectionEnd


Function installServices
  
  ExpandEnvStrings $0 %COMSPEC%
  Exec '"$INSTDIR\nssm.exe" install "ConnectorAbi"  "$INSTDIR\node.exe" "connector.js"'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorAbi" AppParameters "connector.js"'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorAbi" AppDirectory $INSTDIR\'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorAbi" AppStdout $INSTDIR\log.log'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorAbi" AppStderr $INSTDIR\error.log'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorAbi" AppStopMethodSkip 6'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorAbi" AppStopMethodConsole 1000'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorAbi" AppThrottle 5000'
  Exec '"$INSTDIR\nssm.exe" start "ConnectorAbi"'

FunctionEnd
