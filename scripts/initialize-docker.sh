#!/bin/bash

# define a clean error handler
function err { >&2 echo "Error: $1"; exit 1; }

# Sanity check: were we given a hostname?
[[ -n "$1" && -z "$2" ]] || err "Provide droplet's hostname as the first arg"

hostname=$1
me=`whoami`

# Prepare to set or use our user's password
echo "Enter sudo password for REMOTE machine's user (no echo)"
echo -n "> "
read -s password
echo

# If we can login as root then setup a sudo user & turn off root login
if ssh -q root@$hostname exit 2> /dev/null
then
  ssh root@$hostname "bash -s" <<-EOF
	set -e
	
	adduser --gecos "" $me <<EOIF
	$password
	$password
	EOIF
	usermod -aG sudo $me
	
	cp -vr /root/.ssh /home/$me
	chown -vR $me:$me /home/$me
	
	# Turn off password authentication
	sed -i '/PasswordAuthentication/ c\
	PasswordAuthentication no
	' /etc/ssh/sshd_config
	
	# Turn off root login
	sed -i '/PermitRootLogin/ c\
	PermitRootLogin no
	' /etc/ssh/sshd_config
	
	EOF

fi

ssh $hostname "sudo -S bash -s" <<EOF
$password

# Upgrade Everything without prompts
# https://askubuntu.com/questions/146921/how-do-i-apt-get-y-dist-upgrade-without-a-grub-config-prompt
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade
apt-get autoremove -y

# Setup firewall
ufw --force reset
ufw allow 22 &&\
ufw --force enable

# Install docker dependencies
apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Get the docker team's official gpg key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Add the docker repo & install
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu \`lsb_release -cs\` stable"
apt-get update -y && apt-get install -y docker-ce

usermod -aG docker $me
systemctl enable docker

privateip=\`ifconfig eth1 | grep 'inet addr' | awk '{print \$2;exit}' | sed 's/addr://'\`
docker swarm init "--advertise-addr=\$privateip"

# Double-check upgrades
DEBIAN_FRONTEND=noninteractive apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade
apt-get autoremove -y

# Setup Swap
if [[ ! -f /swp ]]
then
  fallocate -l 2G /swp && chmod 600 /swp && mkswap /swp
fi

if [[ -z "\`grep swap /etc/fstab\`" ]]
then
  echo '/swp none swap sw 0 0' >> /etc/fstab
fi

# Swap is slow, don't use it unless absolutely necessary
sed -i '/vm.swappiness/d' /etc/sysctl.conf
echo 'vm.swappiness=10' >> /etc/sysctl.conf

reboot
EOF
