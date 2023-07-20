---
date: 2023-07-10
title: DDNS
page: false
tags:
  - Docker
describe:  DDNS（Dynamic Domain Name Server，动态域名服务）是将用户的动态IP地址映射到一个固定的域名解析服务上，用户每次连接网络的时候客户端程序就会通过信息传递把该主机的动态IP地址传送给位于服务商主机上的服务器程序，服务器程序负责提供DNS服务并实现动态域名解析

---

# Docker部署DDNS服务

## 1.拉取镜像

```shell
sudo docker pull jeessy/ddns-go
```



## 2.创建挂载文件

```shell
sudo mkdir /home/docker/ddns-server/ddns-go
```



## 3.启动容器

```shell
sudo docker run -d \
		   		-p 51002:9876 \
		   		--name ddns-go \
           		--restart=always \
          		 -v /home/docker/ddns-server/ddns-go:/root jeessy/ddns-go:latest
```



[吃井不忘挖水人](https://github.com/NewFuture/DDNS)

[吃井不忘挖水人](https://github.com/jeessy2/ddns-go)
