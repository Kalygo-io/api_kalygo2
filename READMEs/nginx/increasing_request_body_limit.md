# Adjusting request body limits on nginx server to support larger files

- sudo vi /etc/nginx/nginx.conf

- add `client_max_body_size 100M;` to server block
- sudo nginx -t
- sudo systemctl restart nginx.service