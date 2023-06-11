###
 # @Author: wangshicheng
 # @Date: 2021-09-11 16:42:09
 # @Description: 发布脚本
 # @FilePath: /clip-img/release.sh
### 
# 部署脚本是 shell 脚本，shell 脚本就是封装了多行控制台命令，来逐行解释他们的含义。

# 用来表示它是一个 shell 脚本。
#!/usr/bin/env sh

# 告诉脚本如果执行结果不为 true 则退出。
set -e

# 在控制台输出 Enter release version:。
echo "Enter release version: "

# 表示从标准输入读取值，并赋值给 $VERSION 变量。
read VERSION

# 其中 read -p 表示给出提示符x
# -n 1 表示限定最多可以有 1 个字符可以作为有效读入
# -r 表示禁止反斜线的转义功能。因为我们的 read 并没有指定变量名，那么默认这个输入读取值会赋值给 $REPLY 变量。
read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r

# echo 输出空值表示跳到一个新行，# 在 shell 脚本中表示注释。
echo  # (optional) move to a new line

# 表示 shell 脚本中的流程控制语句，判断 $REPLY 是不是大小写的 y，如果满足，则走到后面的 then 逻辑。
if [[ $REPLY =~ ^[Yy]$ ]]
then

# 在控制台输出 Releasing $VERSION ...。
  echo "Releasing $VERSION ..."
  # commit

# 表示把代码所有变化提交到暂存区。
  git add -A
  git commit -m "[build] $VERSION"

# 修改 package.json 中的 version 字段到 $VERSION，并且提交一条修改记录，提交注释是 [release] $VERSION。
  npm version $VERSION --message "[release] $VERSION"
# 把代码发布到主干分支
  git push origin main

# 是把仓库发布到 npm 上，我们会把 dist 目录下的代码都发布到 npm 上，因为我们在 package.json 中配置的是 files 是 ["dist"]。
  # publish
  yarn publish
fi