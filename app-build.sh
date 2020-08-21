#! /bin/sh

time=$(date "+%Y.%m.%d-%H.%M.%S");
new_name="Enforce-$time.apk";
mv FieldAgent_v3.apk old_builds/$new_name;
echo "Pass: lateral";
. ~/.nvm/nvm.sh;
nvm use 12;
ionic cordova build --release android --prod;
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./my-release-key.jks platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk my-alias;
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk FieldAgent_v3.apk;

