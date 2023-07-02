# Setup NGINX + Express

## nginx 1st

```.sh
sudo yum install nginx
sudo vi /etc/nginx/nginx.conf
nginx -v
sudo systemctl start nginx.service
sudo systemctl status nginx.service
sudo nginx -t
```

you can now access your nginx server via the EIP - http://184.73.125.247/

## Installing nodejs

https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/

```.sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 18.12.0
node -v
```

## pm2

```
sudo npm install pm2@latest -g
npm i -g pm2
```

```for starting express
pm2 start index.js
```

## Installing git

```.sh
sudo yum install git
```

## Install pg 15 (ami-linux 2023 only seems to work with pg 15) 

sudo yum install postgresql15 postgresql15-server
