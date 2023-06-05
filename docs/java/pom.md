---
date: 2023-05-23
title: POM
page: false
tags:
  - Java
describe:  Maven打包配置
---

## pom通过profile设置打包运行环境


```xml
    <build>
        <plugins>
            <plugin>
                <version>3.8.1</version>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>
        </plugins>

        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
    <!--分别设置开发，本地，生产环境-->
    <profiles>
        <profile>
                <!--定义id与maven打包时候的参数对应-->
                <id>local</id>
                <!--配置变量，在property或者yml中使用@xxx@进行引用-->
                <properties>
                    <!--配置变量名及变量值，变量名可以任意定义-->
                    <active>dev</active>
                    <nacos.addr>172.20.238.161:47807</nacos.addr>
                    <nacos.config.namespace>acb25ac2-00b8-4784-b1b7-ebecb732aa2c</nacos.config.namespace>
                    <discovery.ip></discovery.ip>
                </properties>
                <!--默认激活，true：激活，false：不激活-->
                <activation>
                    <activeByDefault>true</activeByDefault>
                </activation>
        </profile>
        <profile>
                <id>intranet-dev</id>
                <properties>
                    <active>dev</active>
                    <nacos.addr>172.20.238.161:47807</nacos.addr>
                    <nacos.config.namespace>350ab81c-e252-4980-b60c-68909ea2bdab</nacos.config.namespace>
                    <discovery.ip></discovery.ip>
                </properties>
        </profile>
    </profiles>
```

## 设置jar包分离

1. SpringBoot默认打包方式，设置三方jar不打到核心包内

```xml
<plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <configuration>
        <executable>true</executable>
        <layout>ZIP</layout>
        <!--将以下模块的jar包，打包到核心包中-->
        <includes>
            <!--如果没有子包，也需要添加一个include，否则还是会和依赖一起打包-->
        <include>
             <groupId>nothing</groupId>
             <artifactId>nothing</artifactId>
        </include>
        </includes>
        </configuration>
</plugin>
```

2. 设置lib包内容

```xml
<plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <configuration>
           <archive>
              <manifest>
                  <addClasspath>true</addClasspath>
                  <classpathPrefix>lib/</classpathPrefix>
                  <mainClass>${程序主入口}</mainClass>
              </manifest>
            </archive>
        </configuration>
</plugin>
            <!--拷贝第三方一来文件到指定目录-->
<plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <executions>
            <execution>
                <id>copy-dependencies</id>
                <phase>package</phase>
                <goals>
                    <goal>copy-dependencies</goal>
                </goals>
            	<configuration>
                    <!--设置依赖jar包的输出目录-->
                   <outputDirectory>${project.build.directory}/lib</outputDirectory>
                   <overWriteReleases>false</overWriteReleases>
                   <overWriteSnapshots>false</overWriteSnapshots>
                   <overWriteIfNewer>true</overWriteIfNewer>
                    <!--排除以下artifactId的jar包-->
                   <excludeArtifactIds>
                   </excludeArtifactIds>
                 </configuration>
             </execution>
         </executions>
</plugin>
```

