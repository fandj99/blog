---
date: 2023-06-05
title: ELK
page: false
tags:
  - Docker
describe:  ELK是三个开源软件的缩写，分别表示：Elasticsearch , Logstash, Kibana , 它们都是开源软件。新增了一个FileBeat，它是一个轻量级的日志收集处理工具(Agent)，Filebeat占用资源少，适合于在各个服务器上搜集日志后传输给Logstash，官方也推荐此工具

---

# Docker搭建ELK日志系统

## 前言

`ELK`即Elasticsearch、Logstash、Kibana,组合起来可以搭建线上日志系统

ELK中各个服务的作用：

- Elasticsearch:用于存储收集到的日志信息；
- Logstash:用于收集日志，SpringBoot应用整合了Logstash以后会把日志发送给Logstash,Logstash再把日志转发给Elasticsearch；
- Kibana:通过Web端的可视化界面来查看日志。

[吃井不忘挖水人](https://blog.csdn.net/axibazZ/article/details/126851769)

## Elasticsearch

### 1.拉取镜像

```shell
sudo docker pull elasticsearch:7.4.0
```

### 2.配置挂载文件和目录

```shell
sudo mkdir -p /home/docker/elasticsearch/{config,data,plugins}
sudo chmod 777 /home/docker/elasticsearch/data
```

### 2.1在config目录下创建elasticsearch.yml配置文件

```shell
cd /home/docker/elasticsearch/config
sudo touch elasticsearch.yml
```

### 3.启动Elasticsearch

```shell
sudo docker run -d \
                --restart=always \
                --name elasticsearch \
                -p 9200:9200 \
                -p 9300:9300 \
                -e "discovery.type=single-node" \
                -e ES_JAVA_OPTS="-Xms256m -Xmx256m" \
                -v /home/docker/elasticsearch/data:/usr/share/elasticsearch/data \
                -v /home/docker/elasticsearch/plugins:/usr/share/elasticsearch/plugins \
                -v /home/docker/elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
                elasticsearch:7.4.0
```

### 4.安装ik分词器

```shell
sudo docker exec -it elasticsearch /bin/bash
cd /usr/share/elasticsearch/bin/
./elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.11.1/elasticsearch-analysis-ik-7.11.1.zip
exit
docker restart elasticsearch
```

### 5.安装Elasticsearch-head

```shell
sudo docker run --restart=always --name elasticsearch-head -p 9100:9100 -d mobz/elasticsearch-head:5
```

### 5.1解决(新建索引与数据浏览)

里面没办法用vi编辑,使用复制文件到外部修改：

```shell
sudo docker cp 7bf0:/usr/src/app/_site/vendor.js /home/docker/
```

application/x-www-form-urlencoded 替换成 application/json;charset=UTF-8

```shell
sudo docker cp /home/docker/vendor.js 7bf0:/usr/src/app/_site
```





## Kibana

### 1.拉取镜像

```shell
sudo docker pull kibana:7.4.0
```

### 2.创建对外挂载的目录和配置文件

```shell
sudo mkdir -p /home/docker/kibana/conf
sudo chmod 777 /home/docker/kibana/conf
cd /home/docker/kibana/conf
```

### 3.创建Kibana.yml

```yml
server.name: kibana
# kibana的主机地址 0.0.0.0可表示监听所有IP
server.host: "0.0.0.0"
# kibana访问es的URL
elasticsearch.hosts: [ "http://192.168.14.86:9200" ]
# # 语言
i18n.locale: "zh-CN"
```

### 4.启动Kibana

```shell
sudo docker run -d \
                --restart=always \
                --name elasticsearch_kibana \
                --privileged=true \
                -p 5601:5601 \
                -v /home/docker/kibana/conf/kibana.yml:/usr/share/kibana/config/kibana.yml  kibana:7.4.0   
```



## Logstash

### 1.拉取镜像

```shell
sudo docker pull logstash:7.4.0
```

### 2.创建配置文件目录

```shell
sudo mkdir -p /home/docker/logstash/conf.d
```

- 在/home/docker/logstash目录下创建logstash.yml

```yml
http.host: "0.0.0.0"
xpack.monitoring.elasticsearch.hosts: [ "http://192.168.168.160:9200" ]
path.config: /usr/share/logstash/config/conf.d/*.conf
path.logs: /usr/share/logstash/logs
```

- 在/home/docker/logstash/conf.d目录下创建syslog.conf

```yml
input {
  syslog {
  type => "system-syslog"
  port => 5044
  }
  tcp {
  mode => "server"
  port => 5044
  codec => json_lines
  }
}
  output {
  elasticsearch {
  # 定义es服务器的ip
  hosts => ["192.168.168.160:9200"]
  # 定义索引
  index => "system-syslog-%{+YYYY.MM}"
  }
}
```

### 3.启动容器

```shell
sudo docker run -d \
                --restart=always \
                -p 5044:5044 \
                -p 9600:9600 \
                --log-driver json-file \
                --log-opt max-size=100m \
                --log-opt max-file=2 \
                -v /home/docker/logstash/logstash.yml:/usr/share/logstash/config/logstash.yml \
                -v /home/docker/logstash/conf.d:/usr/share/logstash/config/conf.d \
                --name logstash logstash:7.4.0
```

### 4.进入容器安装

```shell
sudo docker exec -it {容器编号} /bin/bash
cd /bin
logstash-plugin install logstash-codec-json_lines
```



## ELK设置登录权限

### 1.添加配置

1. elasticsearch.ymls

```yml
#添加如下内容
http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-headers: Authorization
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

2. 重启容器进入后执行：

`./bin/elasticsearch-setup-passwords interactive`

3. 重启访问

   账号：elastic
   密码：你刚才设置的

4. kibana.yml

   ```yml
   # 设置es账号密码
   elasticsearch.username: "elastic"
   elasticsearch.password: "991106"
   ```

   
