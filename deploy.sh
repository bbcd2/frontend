#!/bin/sh

error() {
    echo "error $1 $?"
    exit 1;
}

# SSH_KEY="-i ~/.ssh/sheepy.moe"

SERVERS=("root@bbcd2");
WORKING_DIRECTORY="~/frontend"  # full path
DEPLOY_ARCHIVE="deploy.tar.xz" # no directory depth
CLEAR_COMMAND="find . -maxdepth 1 ! -name '${DEPLOY_ARCHIVE}' ! -name node_modules ! -name .env -exec rm -rf {} +"

echo "Building"
rm -rf build; npm run build || error "building"
echo "Archiving"
tar caf "${DEPLOY_ARCHIVE}" -C build . ../.env ../package.json || error "making archive"

for server in "${SERVERS[@]}"; do
    echo "Deploying to ${server}"
    scp ${SSH_KEY} ${DEPLOY_ARCHIVE} ${server}:"${WORKING_DIRECTORY}/${DEPLOY_ARCHIVE}" || error "copying to ${server}"
    ssh ${SSH_KEY} ${server} "\
        cd "${WORKING_DIRECTORY}" || exit 1; \
        ${CLEAR_COMMAND}; \
        tar xaf ${DEPLOY_ARCHIVE} || exit 1; \
        rm ${DEPLOY_ARCHIVE} || exit 1; \
        sed -i \"s/DEBUG=true/DEBUG=false/g\" .env;\
        npm i || exit 1; \
        pm2 restart frontend" || error "deploying to ${server}"
done