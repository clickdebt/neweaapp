#! /bin/sh
# this is a script to build and sign the app for play store
# We are using my-release-key.jks file for self signing the android app
# enforce.keystore is also a key file but we are not using that as of now
# we need to change the id and version in confif.xml in the widget tag for new release
#

time=$(date "+%Y.%m.%d-%H.%M.%S");
new_name="Enforce-$time.apk";
mv FieldAgent_v3.apk old_builds/$new_name;
echo "Pass: lateral";
. ~/.nvm/nvm.sh;
nvm use 12;
ionic cordova build --release android --prod;
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./my-release-key.jks platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk my-alias;
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk FieldAgent_v3.apk;

