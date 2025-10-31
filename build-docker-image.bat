aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 110854640660.dkr.ecr.ap-southeast-2.amazonaws.com
docker build -t fluenccy-app .
docker tag fluenccy-app:latest 110854640660.dkr.ecr.ap-southeast-2.amazonaws.com/development-fluenccy-app:latest
docker push 110854640660.dkr.ecr.ap-southeast-2.amazonaws.com/development-fluenccy-app:latest
