# Getting started with Ansible

## Install Ansible

```
which ansible
```

-- or --

https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html

## 1st ansible command √ WORKS!

TIP: 1st create an inventory file with each host IP/host name per line

ansible all --key-file <PATH_TO_SSH_KEY> -i inventory -m ping -u <REMOTE_LOGIN_USER>

## ansible.cfg √ WORKS!

- creating one in the <PROJECT_ROOT>

now you can run...

ansible all -m ping -u <REMOTE_LOGIN_USER>

## another adhoc ansible command √ WORKS!

ansible all --list-hosts

##  another adhoc ansible command √ WORKS!

ansible all -m gather_facts

##  another adhoc ansible command √ WORKS!

ansible all -m gather_facts --limit <REMOTE_LOGIN_USER>@<REMOTE_IP>

##  another adhoc ansible command √ WORKS!

ansible all -m yum -a update_cache=true

-- or if password is needed but I didn't test the command below --

ansible all -m yum -a update_cache=true --become --ask-become-pass

## another adhoc ansible command

ansible all -m yum -a "update" --become --ask-become-password

##

