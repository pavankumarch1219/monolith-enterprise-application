const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, TableOfContents
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 32, color: "1F3864" })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, size: 26, color: "2E75B6" })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true, size: 24, color: "2F5597" })] });
}
function para(text) {
  return new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after: 120 } });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 80 }
  });
}
function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "C7254E" })],
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    spacing: { before: 60, after: 60 },
    indent: { left: 400 }
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 100 }
  });
}
function divider() {
  return new Paragraph({
    children: [new TextRun("")],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6", space: 1 } },
    spacing: { before: 200, after: 200 }
  });
}
function tableRow(col1, col2, isHeader = false) {
  return new TableRow({
    children: [col1, col2].map((text, idx) => new TableCell({
      borders,
      width: { size: idx === 0 ? 3500 : 5860, type: WidthType.DXA },
      shading: { fill: isHeader ? "1F3864" : (idx === 0 ? "F2F2F2" : "FFFFFF"), type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text, size: 20, bold: isHeader, color: isHeader ? "FFFFFF" : "000000" })] })]
    }))
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: "1F3864" }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: "2E75B6" }, paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: "2F5597" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 }
      }
    },
    children: [

      // TITLE PAGE
      new Paragraph({ children: [new TextRun("")], spacing: { before: 1440 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "SNOWMAN ENTERPRISE APPLICATION", bold: true, size: 48, color: "1F3864", font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Infrastructure & CI/CD Execution Guide", size: 32, color: "2E75B6", font: "Arial" })],
        spacing: { after: 200 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Complete Step-by-Step Deployment Playbook", size: 24, color: "595959", italics: true })]
      }),
      new Paragraph({ children: [new TextRun("")], spacing: { before: 400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Repository: github.com/adikarthik/monolith-enterprise-application", size: 20, color: "595959" })]
      }),
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),

      // ── SECTION 1: Project Overview ─────────────────────────────────────────
      h1("1. Project Overview"),
      para("Snowman is a Java-based monolithic Enterprise Management System (EMS) built using a Hexagonal (Ports & Adapters) architecture. It exposes employee management functionality via REST-like endpoints and uses Embedded Jetty as its HTTP server — meaning it requires no external application server."),
      divider(),
      h2("Technology Stack"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3500, 5860],
        rows: [
          tableRow("Component", "Technology / Version", true),
          tableRow("Language", "Java 7 (compatible with Java 8)"),
          tableRow("Framework", "Spring MVC, Spring Core"),
          tableRow("HTTP Server", "Embedded Jetty (no external server needed)"),
          tableRow("Data Access", "JDBC, Spring JdbcTemplate, Hibernate/JPA"),
          tableRow("Database", "MySQL 5.7"),
          tableRow("Messaging", "Apache ActiveMQ (JMS)"),
          tableRow("DB Migrations", "Liquibase"),
          tableRow("Build Tool", "Apache Maven (Uber JAR via Shade Plugin)"),
          tableRow("Architecture", "Hexagonal (Ports & Adapters)"),
          tableRow("CI (Original)", "Travis CI (.travis.yml)"),
        ]
      }),
      new Paragraph({ children: [new TextRun("")], spacing: { after: 200 } }),

      h2("Architecture Pattern"),
      para("The application uses Hexagonal Architecture where the core domain (business logic) sits at the centre. The outer layers include the database adapters (JDBC, JPA), REST controllers, and the messaging adapter (ActiveMQ/JMS)."),

      // ── SECTION 2: Prerequisites ─────────────────────────────────────────────
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),
      h1("2. Prerequisites & Installation"),
      para("Install all tools below before proceeding. Commands shown for Ubuntu/Debian Linux."),
      divider(),

      h2("2.1  Java 8 (JDK)"),
      code("sudo apt-get update && sudo apt-get install -y openjdk-8-jdk"),
      code("java -version   # Expected: openjdk version 1.8.0_xxx"),

      h2("2.2  Apache Maven"),
      code("sudo apt-get install -y maven"),
      code("mvn -version    # Expected: Apache Maven 3.x.x"),

      h2("2.3  MySQL Server"),
      code("sudo apt-get install -y mysql-server mysql-client"),
      code("sudo systemctl start mysql && sudo systemctl enable mysql"),

      h2("2.4  Docker & Docker Compose"),
      code("curl -fsSL https://get.docker.com | sh"),
      code("sudo usermod -aG docker $USER && newgrp docker"),
      code("docker --version"),

      h2("2.5  Terraform (for AWS infra)"),
      code("wget https://releases.hashicorp.com/terraform/1.7.0/terraform_1.7.0_linux_amd64.zip"),
      code("unzip terraform_1.7.0_linux_amd64.zip && sudo mv terraform /usr/local/bin/"),
      code("terraform version"),

      h2("2.6  AWS CLI"),
      code('curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip'),
      code("unzip awscliv2.zip && sudo ./aws/install"),
      code("aws --version"),

      // ── SECTION 3: Clone & Build ─────────────────────────────────────────────
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),
      h1("3. Clone & Build the Application"),
      divider(),

      h2("3.1  Clone Repository"),
      code("git clone https://github.com/adikarthik/monolith-enterprise-application.git"),
      code("cd monolith-enterprise-application"),

      h2("3.2  Setup Local MySQL Database"),
      code("mysql -u root -p"),
      para("Then run inside MySQL prompt:"),
      code("CREATE DATABASE IF NOT EXISTS snowman CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"),
      code("CREATE USER 'snowman_user'@'localhost' IDENTIFIED BY 'snowman_pass';"),
      code("GRANT ALL PRIVILEGES ON snowman.* TO 'snowman_user'@'localhost';"),
      code("FLUSH PRIVILEGES; EXIT;"),

      h2("3.3  Run Liquibase Migrations"),
      para("Apply all database schema changesets before running the application:"),
      code("mvn liquibase:update \\"),
      code("  -Dliquibase.url=jdbc:mysql://localhost:3306/snowman \\"),
      code("  -Dliquibase.username=snowman_user \\"),
      code("  -Dliquibase.password=snowman_pass"),
      para("To rollback 1 changeset (if needed):"),
      code("mvn liquibase:rollback -Dliquibase.rollbackCount=1"),

      h2("3.4  Build the Uber JAR"),
      para("The Maven Shade Plugin bundles all dependencies into a single executable JAR:"),
      code("# Full build with tests:"),
      code("mvn clean test package -B"),
      code(""),
      code("# Fast build (skip tests):"),
      code("mvn clean package -DskipTests -B"),
      para("Output: target/Snowman.jar"),

      // ── SECTION 4: Running Locally ───────────────────────────────────────────
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),
      h1("4. Running the Application Locally"),
      divider(),

      h2("4.1  Single Instance (Default)"),
      code("java -jar target/Snowman.jar"),
      para("The app starts on port 8080 with Embedded Jetty. Access it at: http://localhost:8080"),

      h2("4.2  Horizontal Scaling (Multiple Instances)"),
      para("The README recommends running multiple instances on different ports to simulate horizontal scaling:"),
      code("java -jar -Dport=8080 target/Snowman.jar &"),
      code("java -jar -Dport=8081 target/Snowman.jar &"),
      code("java -jar -Dport=8082 target/Snowman.jar &"),

      h2("4.3  Vertical Scaling (JVM Tuning)"),
      code("java -Xms256m -Xmx2048m -jar target/Snowman.jar"),

      h2("4.4  Full Stack with Docker Compose"),
      para("Use Docker Compose to spin up the full stack: MySQL, ActiveMQ, 2 app nodes, and NGINX load balancer:"),
      code("cd docker/"),
      code("docker-compose up -d --build"),
      code("docker-compose logs -f snowman-app-1"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3500, 5860],
        rows: [
          tableRow("URL", "Service", true),
          tableRow("http://localhost:80", "NGINX Load Balancer (both nodes)"),
          tableRow("http://localhost:8080", "App Node 1 (direct)"),
          tableRow("http://localhost:8081", "App Node 2 (direct)"),
          tableRow("http://localhost:8161", "ActiveMQ Admin (admin/admin)"),
          tableRow("localhost:3306", "MySQL Database"),
        ]
      }),
      new Paragraph({ children: [new TextRun("")], spacing: { after: 160 } }),

      // ── SECTION 5: AWS Infrastructure ───────────────────────────────────────
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),
      h1("5. AWS Infrastructure (Terraform)"),
      divider(),
      para("The Terraform configuration creates a production-grade AWS deployment with VPC isolation, Auto Scaling, load balancing, and managed database and messaging services."),

      h2("5.1  Infrastructure Components"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3500, 5860],
        rows: [
          tableRow("AWS Resource", "Purpose", true),
          tableRow("VPC + Subnets", "Isolated network with public & private subnets across 2 AZs"),
          tableRow("Internet Gateway + NAT", "Public internet access; outbound for private EC2 instances"),
          tableRow("Application Load Balancer", "Distributes HTTP traffic to app instances"),
          tableRow("EC2 Auto Scaling Group", "Runs the Snowman JAR on 2-6 EC2 instances (t3.medium)"),
          tableRow("RDS MySQL 5.7", "Managed relational database with automated backups"),
          tableRow("Amazon MQ (ActiveMQ)", "Managed JMS message broker replacing local ActiveMQ"),
          tableRow("S3 Bucket", "Stores built Uber JARs for versioned deployments"),
          tableRow("IAM Roles", "EC2 instance permissions for SSM, CloudWatch, S3"),
          tableRow("CloudWatch Alarms", "CPU-based auto scaling triggers (scale out >75%, scale in <25%)"),
        ]
      }),
      new Paragraph({ children: [new TextRun("")], spacing: { after: 160 } }),

      h2("5.2  Terraform Execution Steps"),
      numbered("Configure AWS credentials: aws configure"),
      numbered("Create S3 backend bucket (one-time):"),
      code("  aws s3 mb s3://snowman-terraform-state --region ap-south-1"),
      code("  aws s3api put-bucket-versioning --bucket snowman-terraform-state \\"),
      code("    --versioning-configuration Status=Enabled"),
      numbered("Create DynamoDB lock table (one-time):"),
      code("  aws dynamodb create-table --table-name snowman-tf-lock \\"),
      code("    --attribute-definitions AttributeName=LockID,AttributeType=S \\"),
      code("    --key-schema AttributeName=LockID,KeyType=HASH \\"),
      code("    --billing-mode PAY_PER_REQUEST --region ap-south-1"),
      numbered("Create terraform.tfvars with your passwords"),
      numbered("Run: terraform init"),
      numbered("Run: terraform plan -var-file=terraform.tfvars"),
      numbered("Run: terraform apply -var-file=terraform.tfvars -auto-approve"),
      numbered("Get the ALB DNS: terraform output alb_dns_name"),

      h2("5.3  terraform.tfvars Example"),
      code('aws_region        = "ap-south-1"'),
      code('environment       = "prod"'),
      code('db_password       = "YourSecureDBPassword123!"'),
      code('mq_password       = "YourSecureMQPassword123!"'),
      code('artifact_bucket   = "snowman-artifacts-prod"'),
      code('ec2_instance_type = "t3.medium"'),
      code('db_instance_class = "db.t3.micro"'),

      // ── SECTION 6: CI/CD Pipelines ───────────────────────────────────────────
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),
      h1("6. CI/CD Pipelines"),
      divider(),
      para("Two pipeline configurations are provided: GitHub Actions (recommended for cloud-native CI) and Jenkins (for on-premise or existing Jenkins infrastructure)."),

      h2("6.1  GitHub Actions Pipeline"),
      para("File location: .github/workflows/ci-cd.yml"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3500, 5860],
        rows: [
          tableRow("Stage", "Action", true),
          tableRow("1. Build & Test", "Maven compile → unit tests → integration tests (MySQL + ActiveMQ containers)"),
          tableRow("2. Code Quality", "SpotBugs, PMD, Checkstyle static analysis"),
          tableRow("3. Docker Build & Push", "Build image → push to Amazon ECR + upload JAR to S3"),
          tableRow("4. Deploy Staging", "Liquibase migration → ASG instance refresh → smoke test"),
          tableRow("5. Deploy Production", "Manual approval gate → rolling deploy → health check → Slack notification"),
        ]
      }),
      new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } }),
      h3("Required GitHub Secrets"),
      bullet("AWS_ACCESS_KEY_ID — IAM user with EC2, ECR, S3, ASG permissions"),
      bullet("AWS_SECRET_ACCESS_KEY — Corresponding secret key"),
      bullet("STAGING_ALB_DNS — DNS of staging load balancer"),
      bullet("PROD_ALB_DNS — DNS of production load balancer"),
      bullet("SLACK_WEBHOOK_URL — For deployment notifications"),

      h3("Setup Steps"),
      numbered("Push code to GitHub"),
      numbered('Add secrets in repo Settings → Secrets → Actions'),
      numbered("Copy ci-cd.yml to .github/workflows/ directory"),
      numbered("Push to main/master branch to trigger the pipeline"),

      h2("6.2  Jenkins Pipeline"),
      para("File location: Jenkinsfile"),
      para("The Jenkins pipeline includes the same stages plus SonarQube code quality gate, JaCoCo code coverage, and integration with existing Jenkins infrastructure."),
      h3("Jenkins Plugin Requirements"),
      bullet("Pipeline, Pipeline AWS Steps, Maven Integration"),
      bullet("Slack Notification, JUnit, JaCoCo"),
      bullet("SonarQube Scanner, Docker Pipeline"),
      bullet("AWS S3 Publisher, Blue Ocean (optional)"),

      h3("Jenkins Setup Steps"),
      numbered("Install required plugins via Manage Jenkins → Plugins"),
      numbered("Configure Maven and JDK under Global Tool Configuration"),
      numbered("Add credentials: aws-jenkins-creds, sonar-token, db-creds, slack-token"),
      numbered("Create a Pipeline job pointing to your repository"),
      numbered("Set the Jenkinsfile path and trigger on SCM polling or webhooks"),

      // ── SECTION 7: Deployment Flow ───────────────────────────────────────────
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),
      h1("7. Full Deployment Flow"),
      divider(),
      para("End-to-end deployment sequence from code commit to production:"),
      numbered("Developer pushes code to GitHub main branch"),
      numbered("GitHub Actions / Jenkins triggers the pipeline"),
      numbered("Maven compiles, runs unit tests, integration tests"),
      numbered("SonarQube quality gate passes"),
      numbered("Maven packages Snowman.jar (Uber JAR)"),
      numbered("Docker image built and pushed to Amazon ECR"),
      numbered("JAR uploaded to S3 artifacts bucket with SHA version tag"),
      numbered("Liquibase migrations run against RDS MySQL"),
      numbered("ASG instance refresh starts rolling deployment"),
      numbered("New EC2 instances boot → download JAR from S3 → start app"),
      numbered("ALB health checks confirm /health endpoint returns HTTP 200"),
      numbered("Old instances are terminated (min 75% healthy during rollout)"),
      numbered("Smoke test validates the ALB endpoint"),
      numbered("Slack notification sent to #deployments channel"),

      // ── SECTION 8: Troubleshooting ───────────────────────────────────────────
      new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true }),
      h1("8. Troubleshooting"),
      divider(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3500, 5860],
        rows: [
          tableRow("Problem", "Solution", true),
          tableRow("Liquibase fails - Table already exists", "Run: mvn liquibase:changelogSync to mark all as applied"),
          tableRow("App fails to start - DB connection refused", "Check MySQL is running: systemctl status mysql. Verify credentials in app config."),
          tableRow("ActiveMQ connection refused", "Ensure ActiveMQ is running on port 61616. Check firewall/SG rules."),
          tableRow("Java OutOfMemoryError", "Increase heap: java -Xmx2048m -jar Snowman.jar"),
          tableRow("Docker build fails", "Ensure Docker daemon is running. Check Dockerfile ARG/ENV variables."),
          tableRow("Terraform state locked", "Run: terraform force-unlock <lock-id> (check DynamoDB table)"),
          tableRow("ASG refresh stuck", "Check EC2 instance logs via SSM Session Manager or CloudWatch Logs"),
          tableRow("Health check failing on ALB", "Verify /health endpoint exists. Check app startup logs. Extend health check grace period."),
        ]
      }),

      new Paragraph({ children: [new TextRun("")], spacing: { after: 300 } }),
      divider(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Snowman Enterprise App — Infrastructure Guide", size: 18, color: "595959", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/Snowman_Infrastructure_Guide.docx', buffer);
  console.log('✅ Document created successfully');
});
