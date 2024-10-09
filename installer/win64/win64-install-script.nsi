
;Include Modern UI

!include "MUI2.nsh"
Icon "img\connector.ico"

Name "Connector Client"

OutFile "connectorclient-setup.exe"

InstallDir "$APPDATA\ConnectorClient"
;InstallDir "$PROGRAMFILES\ConnectorClient"

InstallDirRegKey HKLM "Software\ConnectorClient" "Install_Dir"


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
  

  File /r /x ".env*" /x "installer"  /x ".*" "..\..\client\*.*"

  SetOutPath $INSTDIR\img
  File /r "img\*.ico"
  
  SetOutPath $INSTDIR
  
  WriteRegStr HKLM "Software\ConnectorClient" "Install_Dir" "$INSTDIR"
  
  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorClient" "DisplayName" "ConnectorClient"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorClient" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorClient" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorClient" "NoRepair" 1
  WriteUninstaller "uninstall.exe"
  
  CreateDirectory "$SMPROGRAMS\ConnectorClient\"
  CreateShortcut "$SMPROGRAMS\ConnectorClient\Connector Start.lnk" "$INSTDIR\node.exe" "cli.js start" "$INSTDIR\img\database.ico"
  CreateShortcut "$SMPROGRAMS\ConnectorClient\Client User Information.lnk" "$INSTDIR\node.exe" "cli.js show" "$INSTDIR\img\connector.ico"
  CreateShortcut "$SMPROGRAMS\ConnectorClient\Renew Password.lnk" "$INSTDIR\node.exe" "cli.js renewpass" "$INSTDIR\img\shield.ico"
  CreateShortcut "$SMPROGRAMS\ConnectorClient\Uninstall.lnk" "$INSTDIR\uninstall.exe"
  ;create desktop shortcut
  CreateShortCut "$DESKTOP\ConnectorClient.lnk" "$INSTDIR\node.exe" "cli.js show" "$INSTDIR\img\connector.ico"

SectionEnd


Section "Uninstall"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ConnectorClient"
  DeleteRegKey HKLM "SOFTWARE\ConnectorClient"

  ExpandEnvStrings $0 %COMSPEC%
  ExecWait '"$INSTDIR\nssm.exe" stop "ConnectorClient"'
  ExecWait '"$INSTDIR\nssm.exe" remove "ConnectorClient" confirm'


  Delete $INSTDIR\*.*

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\ConnectorClient\*.*"
  Delete "$DESKTOP\ConnectorClient.lnk"

  ; Remove directories used
  RMDir "$SMPROGRAMS\ConnectorClient"
  RMDir /r "$INSTDIR"

SectionEnd


Function installServices
  
  ExpandEnvStrings $0 %COMSPEC%
  Exec '"$INSTDIR\nssm.exe" install "ConnectorClient"  "$INSTDIR\node.exe" "connector.js"'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorClient" AppParameters "connector.js"'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorClient" AppDirectory $INSTDIR\'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorClient" AppStdout $INSTDIR\log.log'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorClient" AppStderr $INSTDIR\error.log'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorClient" AppStopMethodSkip 6'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorClient" AppStopMethodConsole 1000'
  Exec '"$INSTDIR\nssm.exe" set "ConnectorClient" AppThrottle 5000'
  Exec '"$INSTDIR\nssm.exe" start "ConnectorClient"'

FunctionEnd
