# Dev notes

## Fix: "Deprecated Gradle features" warning (build incompatible with Gradle 9.0)

**Cause**: the `cordova-plugin-qrscanner` plugin (v3.0.1, long unmaintained) used deprecated
things in its Android part that Gradle flagged as deprecated and that would stop working with
Gradle 9:

- `plugins/cordova-plugin-qrscanner/src/android/qrscanner.gradle`
  - `repositories { jcenter() }` – JCenter has been a defunct repository for years
  - `compile '...'` in `dependencies` – old Gradle DSL, replaced by `implementation`
  - `buildToolsVersion '23.0.2'` – unnecessary override to an old build tools version

- `plugins/cordova-plugin-qrscanner/src/android/QRScanner.java`
  - import `android.support.v4.app.ActivityCompat` (old Android Support Library package)
  - after enabling AndroidX/Jetifier (`gradle.properties`: `android.useAndroidX=true`,
    `android.enableJetifier=true`) the class gets renamed to `androidx.core.app.ActivityCompat`,
    so the original import no longer existed and the build failed with
    `cannot find symbol ActivityCompat`

**Fix**:
1. In `qrscanner.gradle`, removed `jcenter()` and `buildToolsVersion`, `compile` → `implementation`.
2. In `QRScanner.java`, changed the import to `androidx.core.app.ActivityCompat`.

Verified: `cd platforms/android && ./gradlew assembleDebug --warning-mode all` → `BUILD SUCCESSFUL`,
with no "Deprecated Gradle features were used" warning.

**Note**: `plugins/cordova-plugin-qrscanner/` is the local (vendored) plugin source, which gets
copied into `platforms/android/` on `cordova prepare`. The `platforms/` folder is gitignored and
regenerated from scratch, so the fix must remain committed in `plugins/cordova-plugin-qrscanner/` –
otherwise, on a fresh download of the plugin from npm (version 3.0.1), the deprecated things
would come back.
