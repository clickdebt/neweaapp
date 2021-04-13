#sudo ionic cordova build android --release --prod;
#sudo npm run ionic:build --prod
#sudo ionic cordova build android --release
#echo "Build success.. "
rm android-builder/app-release-unsigned.apk
rm android-builder/Field_AGENT_V3.apk
ionic cordova build android --release --prod;

# echo "Coping unsing APK"
# cp  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk android-builder/;
# echo "Copy unsing APK success"


echo "Singing APK-  pass: neweaapp"
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore neweaapp.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk neweaapp;
echo "Singing APK success"

APKDate=`date '+%d%^b'`

echo "Zipping APK"
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk EA_APP.apk
echo "Congratulations your build is ready."
