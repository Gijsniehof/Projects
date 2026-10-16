# Building the APK on Windows

First build takes 20–40 minutes (mostly downloads). Later builds take a few minutes.

## 1. Install the tools (once)

Open **PowerShell** and run:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Microsoft.OpenJDK.17
winget install Google.AndroidStudio
```

Then open **Android Studio** once, choose the **Standard** setup and accept all licenses.
In Android Studio go to **Settings → Languages & Frameworks → Android SDK**:

- **SDK Platforms**: tick the newest Android platform (this app compiles against API 37).
- **SDK Tools**: make sure **Android SDK Build-Tools** and **Android SDK Platform-Tools** are ticked.

Click **Apply**. Missing pieces (such as the NDK) are downloaded automatically during the first build.

## 2. Set environment variables (once)

In PowerShell:

```powershell
[Environment]::SetEnvironmentVariable('ANDROID_HOME', "$env:LOCALAPPDATA\Android\Sdk", 'User')
[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','User') + ";$env:LOCALAPPDATA\Android\Sdk\platform-tools", 'User')
$jdk = (Get-ChildItem 'C:\Program Files\Microsoft' -Directory -Filter 'jdk-17*')[0].FullName
[Environment]::SetEnvironmentVariable('JAVA_HOME', $jdk, 'User')
```

**Close PowerShell and open a new one**, then check:

```powershell
node -v          # v22 or newer
java -version    # must say 17
adb --version
```

## 3. Put the project in a short path

Unzip `partyspellen.zip` to **`C:\dev\`** so you get `C:\dev\imposter-app`.
Don't use Desktop/Documents if OneDrive syncs them, and keep the path short: Windows has a path-length limit that breaks Android builds in deep folders.

## 4. Build

```powershell
cd C:\dev\imposter-app
npm install
npx expo prebuild --platform android
cd android
.\gradlew.bat assembleRelease
```

The APK is at:

```
C:\dev\imposter-app\android\app\build\outputs\apk\release\app-release.apk
```

## 5. Install on your phone

Either copy the APK to the phone (USB, Google Drive, mail) and tap it. Android asks to allow installing from that app the first time.
Or, with USB debugging on: `adb install app\build\outputs\apk\release\app-release.apk` (from the `android` folder).

## Rebuilding after code changes

```powershell
cd C:\dev\imposter-app\android
.\gradlew.bat assembleRelease
```

After changing `app.json` or adding packages, run `npx expo prebuild --platform android --clean` first.

## Common errors

| Error | Fix |
|---|---|
| `SDK location not found` | `ANDROID_HOME` isn't set, or you didn't open a new PowerShell after setting it. |
| `Unsupported class file major version` / Java errors | `java -version` isn't 17. Re-run the `JAVA_HOME` step, open a new PowerShell. |
| `Filename longer than 260 characters` | Move the project to `C:\dev\imposter-app`. |
| License not accepted | Open Android Studio → SDK Manager once, or run `& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --licenses`. |

The APK is signed with a debug key: fine for installing on your own phones, not for the Play Store.
