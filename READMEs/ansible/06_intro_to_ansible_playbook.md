# Ansible Playbooks

create a yaml file ie: `touch install_apache.yml`

## for reference

https://docs.ansible.com/ansible/latest/collections/ansible/builtin/yum_repository_module.html

## test out the playbook

ansible-playbook install_apache.yml

-- or if password is necessary for user --

ansible-playbook install_apache.yml --ask-become-pass

### then test that apache2 or httpd was installed by ssh'ing in and verifying

## test out another .yml file ie: `install_apache_v2.yml`

ansible-playbook install_apache_v2.yml

## test out another .yml file ie: `install_apache_v3.yml`

ansible-playbook install_apache_v3.yml

## test out another .yml file ie: `install_apache_v4.yml`

ansible-playbook install_apache_v4.yml

## test out another .yml file ie: `install_apache_v5.yml`

ansible-playbook install_apache_v5.yml

## test out another .yml file ie: `install_apache_v7.yml`

ansible-playbook install_apache_v7.yml

### NOTE

this v7 version was supposed to remove httpd and php but I still see them installed after running the v7 playbook