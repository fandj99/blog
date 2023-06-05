---
date: 2023-06-05
title: RocketMQ
page: false
tags:
  - Docker
describe:  RocketMQ是一款纯Java、分布式、队列模型的开源消息中间件，支持事务消息、顺序消息、批量消息、定时消息、消息回溯等
---

# Docker部署`RocketMQ`服务

## 1 拉取镜像

### 1.1 `MQ`镜像

```shell
# 拉取镜像
sudo docker pull rocketmqinc/rocketmq:4.3.2
sudo docker pull apache/rocketmq:latest
```

### 1.2 可视化平台镜像

```shell
# 拉取镜像
sudo docker pull styletang/rocketmq-console-ng:1.0.0
sudo docker pull pangliang/rocketmq-console-ng
```



## 2 创建目录

`注意：目录按照自己的实际路径来`

### 2.1 创建`nameserver`目录

```shell
sudo mkdir -p /home/docker/rocketmq-server/data/namesrv/logs /home/docker/rocketmq-server/data/namesrv/store 
```

### 2.2 创建`broker`挂目录

```shell
sudo mkdir -p /home/docker/rocketmq-server/data/broker/logs /home/docker/rocketmq-server/data/broker/store
```

### 2.3 创建`broker`配置文件

```shell
sudo mkdir /home/docker/rocketmq-server/conf/
sudo touch /home/docker/rocketmq-server/conf/broker.conf
```

### 2.4 编辑配置文件

```shell
sudo vi broker.conf
```

### 2.5 写入配置

`注意：如果【brokerIP1】不添加你的外网ip，则在链接服务时会链接不上。`

```shell
# 所属集群名称，如果节点较多可以配置多个
brokerClusterName=DefaultCluster
#broker名称，master和slave使用相同的名称，表明他们的主从关系
brokerName=broker-a
#0表示Master，大于0表示不同的slave
brokerId=0
#表示几点做消息删除动作，默认是凌晨4点
deleteWhen=04
#在磁盘上保留消息的时长，单位是小时
fileReservedTime=48
#有三个值：SYNC_MASTER，ASYNC_MASTER，SLAVE；同步和异步表示Master和Slave之间同步数据的机制；
brokerRole=ASYNC_MASTER
#刷盘策略，取值为：ASYNC_FLUSH，SYNC_FLUSH表示同步刷盘和异步刷盘；SYNC_FLUSH消息写入磁盘后才返回成功状态，ASYNC_FLUSH不需要；
flushDiskType=ASYNC_FLUSH
# 设置broker节点所在服务器的ip地址
namesrvAddr=root.chencd97.cc:51040
#【你的ip地址,如果端口有映射需要把端口写上，不然mq默认走10911端口】
brokerIP1=root.chencd97.cc:51045
# 磁盘使用达到95%之后,生产者再写入消息会报错 CODE: 14 DESC: service not available now, maybe disk full
diskMaxUsedSpaceRatio=95
# Broker 对外服务的监听端口
listenPort=51045
# 自动创建Topic
autoCreateTopicEnable=true
```



## 3 启动服务

### 3.1 启动`nameserver`

```shell
sudo docker run -d \
				--restart=always \
				--name rocketmq_nameserver \
				-p 51040:9876 \
				-v /home/docker/rocketmq-server/data/namesrv/logs:/root/logs \
				-v /home/docker/rocketmq-server/data/namesrv/store:/root/store \
				-e "MAX_POSSIBLE_HEAP=100000000" apache/rocketmq:latest sh mqnamesrv
```

| 参数                             | 描述                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| -d                               | 以守护进程的方式启动                                         |
| --restart=always                 | docker重启时候容器自动重启                                   |
| --name `rocketmq_nameserver`     | 设置容器名字                                                 |
| -p `9876:9876`                   | 把容器内的端口9876挂载到宿主机9876上面                       |
| -v                               | 把容器内的目录挂载到宿主机上，此处的目录应为第二步设置的目录 |
| -e "MAX_POSSIBLE_HEAP=100000000" | 设置容器的最大堆内存为100000000                              |
| `rocketmq`:4.3.2                 | 镜像名称:版本号                                              |
| sh `mqnamesrv`                   | 启动`nameserv`服务                                           |

### 3.2 启动broker

```shell
sudo docker run -d \
				--restart=always \
				--name rocketmq_broker \
				--link rocketmq_nameserver:namesrv \
				-p 51045:10911 \
				-p 51046:10909 \
				-v /home/docker/rocketmq-server/data/broker/logs:/root/logs \
				-v /home/docker/rocketmq-server/data/broker/store:/root/store \
				-v /home/docker/rocketmq-server/conf/:/opt/rocketmq/conf/ \
				-e "NAMESRV_ADDR=namesrv:51040" \
				-e "MAX_POSSIBLE_HEAP=200000000" apache/rocketmq:latest sh mqbroker \
				-c /opt/rocketmq/conf/broker.conf
```

| 参数                                                  | 描述                                                    |
| ----------------------------------------------------- | ------------------------------------------------------- |
| --link rocketmq_nameserver:namesrv                    | 和rocketmq_nameserver容器通信（跟nameserv容器名称对应） |
| --name rocketmq_nameserver                            | 设置容器名字                                            |
| -e `"NAMESRV_ADDR=namesrv:9876"`                      | 指定namesrv的地址为本机namesrv的`ip`地址:9876           |
| sh `mqbroker -c /opt/rocketmq-4.3.2/conf/broker.conf` | 指定配置文件启动broker节点                              |

### 3.3 启动可视化平台

```shell
sudo docker run -d \
				--restart=always \
				--name rocketmq_console \
				-e "JAVA_OPTS=-Drocketmq.namesrv.addr=root.chencd97.cc:51040 \
				-Dcom.rocketmq.sendMessageWithVIPChannel=false \
				-Duser.timezone='Asia/Shanghai" \
				-p 51041:8080 styletang/rocketmq-console-ng:1.0.0
```

```shell
sudo docker run -d \
				--restart=always \
				--name rocketmq_console \
				-e "JAVA_OPTS=-Drocketmq.namesrv.addr=root.chencd97.cc:51040 \
				-Dcom.rocketmq.sendMessageWithVIPChannel=false \
				-Duser.timezone='Asia/Shanghai" \
				-p 51041:8080 apacherocketmq/rocketmq-dashboard:latest
```

[RocketMQ经常碰到的问题](https://www.cnblogs.com/yg_zhang/p/11182497.html)
