---
date: 2023-07-20
title: MySQL
page: false
tags:
  - Docker
describe:  MySQL是一个关系型数据库管理系统，由瑞典MySQL AB 公司开发，属于 Oracle 旗下产品。MySQL 是最流行的关系型数据库管理系统之一，在 WEB 应用方面，MySQL是最好的 RDBMS (Relational Database Management System，关系数据库管理系统) 应用软件之一。
---

## MySQL运行配置

[详情](https://blog.csdn.net/qq_46310975/article/details/126846387)


### 1.拉取镜像
```shell
sudo docker pull mysql:5.7
```
### 2.启动mysql容器拷贝配置文件

```shell
sudo docker run -d \
             --restart=always \
             -p 51020:3306 \
             --name mysql-server_5.7 \
             -e MYSQL_ROOT_PASSWORD=123456 \
             -e TZ=Asia/Shanghai \
             -- mysql:5.7
```
### 3.创建文件夹
```shell
sudo mkdir /home/docker/mysql-server
sudo mkdir /home/docker/mysql-server/config
sudo mkdir /home/docker/mysql-server/log_bin
```
#### 3.1 创建bin_log日志文件
```shell
cd /home/docker/mysql-server/log_bin
sudo touch mysql-bin.log
```

### 4.复制容器中的文件到主机
```shell
sudo docker cp mysql-server_5.7:/etc/my.cnf /home/docker/mysql-server/config/
sudo docker cp mysql-server_5.7:/var/lib/mysql /home/docker/mysql-server/
sudo docker cp mysql-server_5.7:/var/log  /home/docker/mysql-server/
sudo docker cp mysql-server_5.7:/home/docker/mysql-bin  /home/docker/mysql-server/log_bin
```

### 5.启动容器

```shell
------------------------------MySQL数据库 5----------------------------------------------
sudo docker run -d \
                --restart=always \
                -p 51020:3306 \
                -e MYSQL_ROOT_PASSWORD=123456 \
                -e TZ=Asia/Shanghai \
                --name mysql-server_5.7 \
                -v /home/docker/mysql-server/config/my.cnf:/etc/my.cnf:ro \
                -v /home/docker/mysql-server/mysql:/var/lib/mysql \
                -v /home/docker/mysql-server/log:/var/log \
                -v /home/docker/mysql-server/log_bin:/home/docker/mysql-bin \
                -- mysql:5.7 -- 都行
                -- mysql:5 -- 都行
```
