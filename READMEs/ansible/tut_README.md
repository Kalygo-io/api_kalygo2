# Ansible

## Generate an ssh-key

ssh-keygen -t ed25519 -C "ARBITRARY COMMENT"

## Copy ssh key to a server

ssh-copy-id -i ~/.ssh/id_ed25519.pub <IP_OF_REMOTE_SERVER>

## For caching .ssh passwords for ssh-keys in the terminal session

```
eval $(ssh-agent)
ssh-add
```

## running cicd script

ansible-playbook cicd.yml


