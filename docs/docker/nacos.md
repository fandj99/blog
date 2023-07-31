---
date: 2023-07-31
title: Nacos
page: false
tags:
  - Docker
describe:  Nacos 是阿里巴巴推出来的一个新开源项目，这是一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。
---

### nacos配置


#### 1.拉取nacos
```shell
sudo docker pull nacos/nacos-server
```


#### 2.创建文件夹
```shell
sudo mkdir -p /home/docker/nacos-server
sudo mkdir -p /home/docker/nacos-server/conf/
sudo mkdir -p /home/docker/nacos-server/data/
```


### 3.拷贝文件
```shell
sudo docker cp e2e68:/home/nacos/logs /home/docker/nacos
sudo docker cp e2e68:/home/nacos/conf/application.properties /home/docker/nacos/conf/application.properties
sudo docker cp e2e68:/home/nacos/data /home/docker/nacos
```


#### 4.启动容器
```shell
sudo docker run -d \
                --name nacos \
                -p 51060:8848 \
                -p 52060:9848 \
                -p 52061:9849 \
                --restart=always \
                -e JVM_XMS=256m \
                -e JVM_XMX=256m \
                -e MODE=standalone \
                -e PREFER_HOST_MODE=hostname \
                -e SPRING_DATASOURCE_PLATFORM=mysql \
                -e MYSQL_SERVICE_HOST=fan.fandj.cc \
                -e MYSQL_SERVICE_PORT=51020 \
                -e MYSQL_SERVICE_DB_NAME=nacos \
                -e MYSQL_SERVICE_USER=root \
                -e MYSQL_SERVICE_PASSWORD=123456 \
                -e NACOS_AUTH_ENABLE=true \
                -v /home/docker/nacos-server/logs:/home/nacos/logs \
                -v /home/docker/nacos-server/conf/application.properties:/home/nacos/conf/application.properties \
                -v /home/docker/nacos-server/data:/home/nacos/data \
                nacos/nacos-server:latest
```

#### 解读
```shell
docker 启动容器
docker run \

容器名称叫nacos -d后台运行
--name nacos -d \

nacos默认端口8848 映射到外部端口8848
-p 8848:8848 \

naocs 应该是2.0版本以后就需要一下的两个端口 所以也需要开放
-p 9848:9848 
-p 9849:9849 
--privileged=true \

docker重启时 nacos也一并重启
--restart=always \

-e 配置 启动参数
配置 jvm
-e JVM_XMS=256m 
-e JVM_XMX=256m \

单机模式
-e MODE=standalone 
-e PREFER_HOST_MODE=hostname \

数据库是mysql 配置持久化 不使用nacos自带的数据库
-e SPRING_DATASOURCE_PLATFORM=mysql \

写自己的数据库地址
-e MYSQL_SERVICE_HOST=###### \

数据库端口号
-e MYSQL_SERVICE_PORT=3306 \

mysql的数据库名称
-e MYSQL_SERVICE_DB_NAME=nacos \

mysql的账号密码
-e MYSQL_SERVICE_USER=root 
-e MYSQL_SERVICE_PASSWORD=root \

-v 映射docker内部的文件到docker外部 我这里将nacos的日志 数据 以及配置文件 映射出来
映射日志
-v /root/apply/docker/apply/nacos/logs:/home/nacos/logs \

映射配置文件 (应该没用了 因为前面已经配置参数了)
-v /root/apply/docker/apply/nacos/init.d/custom.properties:/home/nacos/conf/application.properties \

映射nacos的本地数据 也没啥用因为使用了mysql
-v /root/apply/docker/apply/nacos/data:/home/nacos/data \

启动镜像名称
nacos/nacos-server

```

