# Deploy Reactjs, Nodejs Chat app to DigitalOcean hosting (Ubuntu VPS)

## Get DigitalOcean account

I have been using <a href="https://m.do.co/c/bb792e37b9dd">DigitalOcean</a> for me and setup for my customers, so I recommend to use it for your project as well. Just pick the VPS best suited for the size of your project, starting at 5$, 10$ or 20$. The price is very flexible. DO provides SSD cloud hosting at a good price - I don't think you can get same price on other providers with same quality.
Besides, their support is very fast and they have good documentation, and a friendly UI for end-users. 
So lets get started by registering an account and deploy your app at <a href="https://m.do.co/c/bb792e37b9dd">Digitalocean.com</a>

## Setup Ubuntu on DigitalOcean Cloud VPS.

* In this tutorial I will use Ubuntu 16.04, and I also recommend this OS for your VPS. I recommend you choose a suitable VPN, depending on how much traffic you expect. I will start at 20$ a month, and upgrade if necessary.
* Choose a data center region: DigitalOcean has many data centers, which means you can pick the data center near where you expect most of your visitors to live. For example, if I expect all the visitors to come from Vietnam, I will choose the data center closest to Vietnam, which is Singapore.
* Select additional options if you want to have additional backup service, or private network. 
* Add your SSH keys: you can generate your SSH key on your computer and copy it to your VPS, which means when you login from SSH, you're not required to enter a username and password. This is more secure and will save you time. If you would like to know how to generate SSH key and use it on DigitalOcean hosting, I recommend this <a href="https://www.digitalocean.com/community/tutorials/how-to-use-SSH-keys-with-digitalocean-droplets">article</a>
* By default, you create one droplet at a time. If you want to, you can set up multiple droplets at once.
* Name your droplet and click submit, just get a cup of coffee and wait a moment for DigitalOcean to set everything up for you. When you see "Happy coding!" your cloud VPS is ready for use.
* Check your email that you registered with on DigitalOcean. You should receive an email notifying you about your VPS IP, root username and password.
This is the format of the email.
Droplet Name: [Name of your Droplet]
IP Address: [your-VPS-IP]
Username: root
Password: [your-root-password-generated-by-robot]
* Login to your Cloud via terminal by writing 
  ```
  ssh root@YOUR-IP-ADDREESS 
  ```
  Now, enter the root password given in the email. You will be asked for a new password the first time logging in.
  + The server will ask you for your password once more (the password given in the email).
  + Enter a new password
  + Confirm the password, and remember it for later
  + The setup is complete.

## Configuring the Firewall on your Cloud

This is a very important step we need to do. We need to reconfigure our firewall software to allow access to the service
* I recommend open port only for 80, 443, SSH (port 22), but it depends on your project, and it may need more ports open for any other services. In this project we will open port 80 for http access, 443 https (ssl), and port 22 (for SSH login). This will suffice.
* By default Firewall is inactive, which you can check by running 
``` sudo ufw status ```

  ```
  sudo ufw app list
  ```
* So let us config the Firewall and allow those ports by
  ```
  sudo ufw allow 'Nginx Full'
  ```
  
  ```
  sudo ufw allow 'OpenSSH'
  ```
  
  ```
  sudo ufw enable
  ```

## Setup Nodejs on DigitalOcean Ubuntu 16.04 
We are using Nodejs for backend and we will serve the static files of the react application build. So Nodejs is required
* Visit https://nodejs.org/en/download/package-manager/ to see the documentation
* We use package management to install, here is command to install Node.js v9

  ```
  curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
  ```
  ```
  sudo apt-get install -y nodejs
  ```
* After successfully installing Node.js, we can check the version by typing in the command ``` node -v ``` and you should see the current version (v9.3.0 at the time of this writing).

## Setup MongoDB v3.6 on DigitalOcean Ubuntu 16.04 Cloud VPS

We are using MongoDB as a database, and so we can install it my following the documentation https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

* Import the public key used by the package management system
  ```
  sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
  ```
* Create a list file for MongoDB (Ubuntu 16.04)
  ```
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
  ```
* Reload local package database
  ```
  sudo apt-get update
  ```
* Install the latest stable version of MongoDB 
  ```
  sudo apt-get install -y mongodb-org
  ```
* Start MongoDB by running (default port: 27017)
  ```
  sudo service mongod start
  ```
* Stop MongoDB by running
  ```
  sudo service mongod stop
  ```
* Restart MongoDB by running
  ```
  sudo service mongod restart
  ```
 
## Install Nginx - Http Proxy Server
Let me explain simply why we use Nginx for this Nodejs web application.
When we run our chat app, it will run on port 3000, which is the default for running a Nodejs application. We can change the port to 3001, 3002 or 8080, and so on... However, if you point your domain to DigitalOcean cloud VPS, you can access your app throught the domain. For example, you can reach a Nodejs app on the VPS with a port 3000 by vising https://tabvn.com:3000.
In order to set a nodejs web app on the default port of 80, which can be visited by simply going to http://tabvn.com/, we use Nginx. 

* To install Nginx, visit the official documentation at http://nginx.org/en/linux_packages.html 
* So we will run following command on Ubuntu cloud VPS 16.04
  ```
  apt-get update
  ```
  
  ```
  sudo apt-get install nginx
  ```
* Start Nginx: open your IP-address, for example: http://123.456.789. You should see "Welcome to nginx!". All the Nginx configurations is in our cloud at the location /etc/nginx/nginx.conf
  ```
  nginx
  ```
* Stop Nginx 
   ```
   nginx -s stop
   ```
* Reload Nginx
  ```
  nginx -s reload
  ```
* Close your Cloud command line by ``` exit ``` or cloud command line tab in terminal

## Time to Deployment 

* Download the chat app project at https://github.com/tabvn/nodejs-reactjs-chatapp.
  ```
  git clone https://github.com/tabvn/nodejs-reactjs-chatapp.git chatApp
  ```
  ```
  cd chatApp
  ```
  ```
  cd server
  ```
  ```
  npm install
  ```
  ```
  cd ../app
  ```
  ```
  npm install
  ```

* Fixed issue of bcrypt on Ubuntu 16.04

```
sudo apt-get install build-essential

```


## Nginx config sample:
Nginx Websocket document: http://nginx.org/en/docs/http/websocket.html

```
server {
        listen 80;
        root /var/www/html;
        location / {


                proxy_pass http://127.0.0.1:3001;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        }

}
```
See Video: https://www.youtube.com/watch?v=wJsH45eWNBo

