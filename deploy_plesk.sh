#!/bin/bash

rm archive_update.zip
echo "Building.."
npm run build
echo "Archiving.."
mv ./dist/index.html ./dist/index.php
zip -r archive_update.zip ./dist/index.php ./dist/assets
echo "Uploading.."
scp archive_update.zip root@plesk.cobaltfairy.online:/var/www/vhosts/fairymail.app/dashboard.fairymail.app/
echo "Deploying remotely.."
ssh root@plesk.cobaltfairy.online 'rm -f /var/www/vhosts/fairymail.app/dashboard.fairymail.app/index.html 2> /dev/null ; rm -f /var/www/vhosts/fairymail.app/dashboard.fairymail.app/index.php 2> /dev/null ; rm -rf /var/www/vhosts/fairymail.app/dashboard.fairymail.app/assets 2> /dev/null ; unzip -o /var/www/vhosts/fairymail.app/dashboard.fairymail.app/archive_update.zip'
echo "Replacing files, fixing permissions.."
ssh root@plesk.cobaltfairy.online 'mv /var/www/vhosts/fairymail.app/dashboard.fairymail.app/dist/index.php /var/www/vhosts/fairymail.app/dashboard.fairymail.app/index.php ; mv /var/www/vhosts/fairymail.app/dashboard.fairymail.app/dist/assets /var/www/vhosts/fairymail.app/dashboard.fairymail.app/ ; chown -R fairymail.app_c186vu2ap0n:psacln /var/www/vhosts/fairymail.app/dashboard.fairymail.app/* ; chown -R fairymail.app_c186vu2ap0n:psacln /var/www/vhosts/fairymail.app/dashboard.fairymail.app/.htaccess'
echo "Done!\n\n"


e