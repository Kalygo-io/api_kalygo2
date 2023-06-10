# Installing CHROMADB on server

## First install docker

sudo yum install -y docker

## give docker permissions to ec2-user


```.sh
sudo usermod -a -G docker ec2-user
id ec2-user
newgrp docker
```

## install docker-compose as well

```.sh
wget https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)
sudo mv docker-compose-$(uname -s)-$(uname -m) /usr/local/bin/docker-compose
sudo chmod -v +x /usr/local/bin/docker-compose
```

## setup docker daemon as a service


```.sh
sudo systemctl enable docker.service
sudo systemctl start docker.service
sudo systemctl status docker.service
```

## TIP: WHERE ALL THE ABOVE CAME FROM

`https://www.cyberciti.biz/faq/how-to-install-docker-on-amazon-linux-2/`

## Installing chromadb

```.sh
git clone https://github.com/chroma-core/chroma.git
cd chroma
docker-compose up -d --build
```
