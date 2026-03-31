#!/bin/bash
# ============================================================
# Snowman Enterprise App - MASTER EXECUTION GUIDE
# Run each section in order as root or sudo
# ============================================================
set -euo pipefail
 
echo "========================================================"
echo " SNOWMAN ENTERPRISE APP - FULL EXECUTION GUIDE"
echo "========================================================"
 
# ─────────────────────────────────────────────────────────────
# STEP 0: PREREQUISITES (install on your local/dev machine)
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 0: Install Prerequisites"
 
# Java 8
sudo apt-get update && sudo apt-get install -y openjdk-8-jdk
java -version
 
# Maven
sudo apt-get install -y maven
mvn -version
 
# MySQL Client (for running migrations locally)
sudo apt-get install -y mysql-client
 
# Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
docker --version
 
# Terraform
TERRAFORM_VERSION="1.7.0"
wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip
unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip
sudo mv terraform /usr/local/bin/
terraform version
 
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip awscliv2.zip
sudo ./aws/install
aws --version
 
# ─────────────────────────────────────────────────────────────
# STEP 1: CLONE THE REPOSITORY
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 1: Clone Repository"
 
git clone https://github.com/adikarthik/monolith-enterprise-application.git
cd monolith-enterprise-application
 
# Copy infrastructure files into project
cp -r /path/to/snowman-infra/* .
 
# ─────────────────────────────────────────────────────────────
# STEP 2: LOCAL MYSQL SETUP
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 2: Setup Local MySQL"
 
# Start MySQL (local install)
sudo systemctl start mysql
sudo systemctl enable mysql
 
# Create database and user
mysql -u root -p <<SQL
CREATE DATABASE IF NOT EXISTS snowman CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'snowman_user'@'localhost' IDENTIFIED BY 'snowman_pass';
GRANT ALL PRIVILEGES ON snowman.* TO 'snowman_user'@'localhost';
FLUSH PRIVILEGES;
SQL
 
echo "✅ MySQL database 'snowman' created"
 
# ─────────────────────────────────────────────────────────────
# STEP 3: RUN DATABASE MIGRATIONS (Liquibase)
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 3: Run Liquibase Database Migrations"
 
mvn liquibase:update \
  -Dliquibase.url="jdbc:mysql://localhost:3306/snowman" \
  -Dliquibase.username="snowman_user" \
  -Dliquibase.password="snowman_pass"
 
echo "✅ Database schema migrated"
 
# To rollback 1 changeset if needed:
# mvn liquibase:rollback -Dliquibase.rollbackCount=1
 
# ─────────────────────────────────────────────────────────────
# STEP 4: BUILD THE APPLICATION (Uber JAR)
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 4: Build Application"
 
# Run tests + build
mvn clean test package -B
 
# OR skip tests for faster build
# mvn clean package -DskipTests -B
 
echo "✅ Built: target/Snowman.jar"
ls -lh target/Snowman.jar
 
# ─────────────────────────────────────────────────────────────
# STEP 5: RUN LOCALLY (Single Instance)
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 5: Run Locally"
 
# Default port 8080
java -jar target/Snowman.jar
 
# OR with custom port (horizontal scaling):
# java -jar -Dport=8081 target/Snowman.jar
# java -jar -Dport=8082 target/Snowman.jar
 
# With custom JVM memory:
# java -Xms256m -Xmx2048m -jar target/Snowman.jar
 
# ─────────────────────────────────────────────────────────────
# STEP 6: RUN WITH DOCKER (Full Stack - Recommended)
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 6: Run with Docker Compose (Full Stack)"
 
cd docker/
 
# Build and start all services (MySQL, ActiveMQ, App x2, NGINX LB)
docker-compose up -d --build
 
# View logs
docker-compose logs -f snowman-app-1
docker-compose logs -f mysql
 
# Check running services
docker-compose ps
 
# App available at:
echo "  App:      http://localhost:8080  (direct node 1)"
echo "  App:      http://localhost:8081  (direct node 2)"
echo "  NGINX LB: http://localhost:80    (load balanced)"
echo "  ActiveMQ: http://localhost:8161  (admin: admin/admin)"
 
# Stop everything
# docker-compose down
 
cd ..
 
# ─────────────────────────────────────────────────────────────
# STEP 7: PROVISION AWS INFRASTRUCTURE (Terraform)
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 7: Provision AWS Infrastructure with Terraform"
 
cd terraform/
 
# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region: ap-south-1, Format: json
 
# Create S3 backend bucket FIRST (one-time)
aws s3 mb s3://snowman-terraform-state --region ap-south-1
aws s3api put-bucket-versioning \
  --bucket snowman-terraform-state \
  --versioning-configuration Status=Enabled
 
# Create DynamoDB lock table (one-time)
aws dynamodb create-table \
  --table-name snowman-tf-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
 
# Create terraform.tfvars (fill in your values)
cat > terraform.tfvars <<EOF
aws_region        = "ap-south-1"
environment       = "prod"
db_password       = "YourSecureDBPassword123!"
mq_password       = "YourSecureMQPassword123!"
artifact_bucket   = "snowman-artifacts-prod"
ec2_instance_type = "t3.medium"
db_instance_class = "db.t3.micro"
EOF
 
# Initialize Terraform
terraform init
 
# Preview changes
terraform plan -var-file=terraform.tfvars
 
# Apply infrastructure
terraform apply -var-file=terraform.tfvars -auto-approve
 
# Get outputs
terraform output alb_dns_name
terraform output rds_endpoint
 
cd ..
 
# ─────────────────────────────────────────────────────────────
# STEP 8: UPLOAD JAR TO S3
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 8: Upload Artifact to S3"
 
BUILD_SHA=$(git rev-parse --short HEAD)
 
aws s3 cp target/Snowman.jar \
  s3://snowman-artifacts-prod/releases/${BUILD_SHA}/Snowman.jar
 
aws s3 cp target/Snowman.jar \
  s3://snowman-artifacts-prod/releases/latest/Snowman.jar
 
echo "✅ Uploaded to S3: s3://snowman-artifacts-prod/releases/${BUILD_SHA}/"
 
# ─────────────────────────────────────────────────────────────
# STEP 9: DEPLOY TO AWS EC2 (Rolling Update via ASG)
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 9: Rolling Deploy to Production ASG"
 
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name snowman-prod-asg \
  --strategy Rolling \
  --preferences '{"MinHealthyPercentage": 75, "InstanceWarmup": 120}' \
  --region ap-south-1
 
echo "✅ Instance refresh started - check AWS Console for progress"
 
# ─────────────────────────────────────────────────────────────
# STEP 10: VERIFY DEPLOYMENT
# ─────────────────────────────────────────────────────────────
 
echo ""
echo ">>> STEP 10: Verify Deployment"
 
ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name)
 
for i in {1..10}; do
    if curl -sf http://${ALB_DNS}/health; then
        echo "✅ Health check PASSED on attempt $i"
        break
    fi
    echo "Attempt $i failed, waiting 15s..."
    sleep 15
done
 
echo ""
echo "========================================================"
echo " ALL STEPS COMPLETE!"
echo " App URL: http://${ALB_DNS}"
echo "========================================================"
 
