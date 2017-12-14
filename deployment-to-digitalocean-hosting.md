# Deployment Reactjs,Nodejs Chat app to DigitalOcean hosting (Ubuntu Vps)

## Get DigitalOcean account

I have been using <a href="https://m.do.co/c/bb792e37b9dd">DigitalOcean</a> for me and setup for my customers, so  recommend use it for your project just pick vps depend on how big of your project
start at 5$ or 10$, 10$, price very flexiblity. DO providing SSD cloud hosting but good price i dont think you can get same price on other providers with same quality.
beside their support very fast and well documentation , friendly UI for end-user. 
so let get start register an account and deploy your app at <a href="https://m.do.co/c/bb792e37b9dd">Digitalocean.com</a>

## Setup Ubuntu on DegitalOcean Cloud VPS.

*  in this tutorial i will use Ubuntu and i also recommend this OS for your vps. but it is your choose. for me i use Ubuntu 16.04 version.
for price it is depend on how big of your project how many trafics to. for me i start at 20$/month is good start and then we can upgrade.
* Choose a datacenter region: DigitalOcean has many datacenters that mean you can pick one for your project if your visitors almost from NY United States let select New York, so example if i target all visitors from Vietnam for a project so i can pick a datacenter near Vietnam is Singapore.
* Select additional options: if you want to have additional  backup service, or  private network. 
* Add your SSH keys: you can genrate your ssh key on your computer and copy it to your vps and that mean when you login from ssh dont have to enter the password of root account any more, save your time and more security, if you would to know how to generate ssh key and use it on DigitalOcean hosting let see this <a href="https://www.digitalocean.com/community/tutorials/how-to-use-ssh-keys-with-digitalocean-droplets">article</a>
* Droplet default is 1 if you want to setup mutiply droplets at once time let use it.
* name of your droplet and click submit, just get a cup of coffee and wait a moment for DigitalOcean setup for you. until you see "Happy coding!" Your cloud vps is ready to use.
* Check your email address that you did register in DigitalOcean you shold get an email notify about your VPS IP, root account and password.
here is format of your email
Droplet Name: [Name of your Droplet]
IP Address: [your-vps-IP]
Username: root
Password: [your-root-password-generated-by-robot]
* Login to your Cloud via terminal by use 
  ```
  ssh root@YOUR-IP-ADDREESS 
  ```
  now enter your root password that in your email. You will asking for change new password at the first time.
  + Server will ask you current password again (this is password in your email)
  + Enter new password
  + Confirm password , and remember it for later. 
  + Done and happy seting up your cloud.

## Configure Firewall on your Cloud

This is very important step we need to do. so we need to reconfigure our firewall software to allow access to the service
* I recommend open port only for 80,443, ssh (port 22), but it is depend on your project may need more port open for other service. in this project we need open port 80 for http access, 443 https (ssl) , and port 22 (for ssh login) that is ennough.
* By default Firewall is inactive, you can check it by run command 
``` sudo ufw status ```
* So let config FW allow those ports by 
  ```
  sudo ufw allow 80
  
  ```
  
  ```
  sudo ufw allow 443
  
  ```
  
  ```
  sudo ufw allow 'OpenSSH'
  
  ```
  
  ```
  sudo ufw enable
  ```

## Setup Nodejs on DegitalOcean Ubuntu 16.04 
We are using nodejs for backend and will serve static files of react application build. So Nodejs is required
* visit https://nodejs.org/en/download/package-manager/ to see the documentation
* We use package management to install, here is command to install Node.js v9

  ```
  curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -

  ```
  ```
  sudo apt-get install -y nodejs
  ```
* After successful Node.js installed we can check the version by typing in command line : ``` node -v ``` and you see see "v9.3.0" 

## Setup MongoDB v3.6 on DigitalOcean Ubuntu 16.04 Cloud VPS

We are using MongoDB for database in backend restful service so let install Mongodb by follow the documentation https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/ 
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
* Start MongoDB (Port running default: 27017)
  ```
  sudo service mongod start
  
  ```
* If You Want to Stop MongoDB
  ```
  sudo service mongod stop
  ```
* Or Restart MongoDB
  ```
  sudo service mongod restart
  ```
 
