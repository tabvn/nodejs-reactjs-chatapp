# nodejs-reactjs-chatapp

Create messenger chat application use Nodejs Expressjs, Reactjs.

## Screenshot:

<img src="https://lh3.googleusercontent.com/bk7OOm_rDDP8TgKK3KYj5lEVBc4FptkWBlGce6_pRjBj2TMTSQD6jgTdxyU0vqI30AaacSntUuhzkiltph_jMJYI4bUrjN3AVcoyDp-HC0aR-iXZ_zoLhR9cfeI9gdifcnPp8TlRpQ=w2548-h1318-no" />

## Server

``` 
cd server 
```
```
npm install
```

```
npm run dev
```
### Reactjs App development

```
cd app
```

```
npm start
```

### Reactjs App development using docker-compose

The docker-compose files are located in the two different application folders app and server. To run all the functions using docker run the follow commands:
``` 
cd server 
```
```
docker-compose up
```
At this moment the server application side will be running.

Now it's time to run application front end. Open a new terminal (window or tab) and in the project folder use the following commands:
``` 
cd app 
```
```
docker-compose up
```

Attention: Deppending on the way you have installed the docker in your compile you may use **sudo** command to run docker, for example:
``` 
sudo docker-compose up
```

For more docker informations and how to install access https://www.docker.com/ .
 
## Tutorials
* Checkout the video toturials list: https://www.youtube.com/playlist?list=PLFaW_8zE4amPaLyz5AyVT8B_wfOYwd8x8
* My Facebook: https://www.facebook.com/TabvnGroup/
* Youtube Chanel: https://youtube.com/TabvnChanel


## Deploy Node.js React.js to DigitalOcean.com Ubuntu 16.04 Cloud VPS 

* <a href="https://github.com/tabvn/nodejs-reactjs-chatapp/blob/master/deployment-to-digitalocean-hosting.md">Document</a>
* Video: https://www.youtube.com/watch?v=wJsH45eWNBo

