pipeline {
    agent {
        label 'LocalWindows'
    }

    environment {
        IMAGE_NAME = 'bhavin42/ai-demo'
        IMAGE_TAG = "${BUILD_NUMBER}"
        SONAR_HOME = tool 'SonarQubeScanner'
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "Git checkout started"

                git(
                    url: 'https://github.com/jethavabhavin/ai-demo',
                    branch: 'main'
                )

                echo "Git checkout completed"
            }
        }
        
        stage('Generate .env File') {
            steps {
                echo "Generating server .env file..."
                withCredentials([
                    file(credentialsId: 'ServerEnv', variable: 'ENV_FILE')
                ]) {
                    bat 'copy /Y "%ENV_FILE%" "apps\\server\\.env"'
                }
                echo "Server .env file generated"

                echo "Generating pwa .env file..."
                withCredentials([
                    file(credentialsId: 'PwaEnv', variable: 'ENV_FILE')
                ]) {
                    bat 'copy /Y "%ENV_FILE%" "apps\\pwa\\.env"'
                }
                echo "PWA .env file generated"
            }
        }

        stage('Check Environment') {
            steps {
                echo "Checking Windows environment..."

                bat 'docker --version'
                bat 'docker info'
                bat 'git --version'
            }
        }

        stage('Docker Login') {
            steps {
                script {
                    echo "Docker login started..."

                    withCredentials([
                        usernamePassword(
                            credentialsId: 'DockerHub',
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )
                    ]) {
                        bat '''
                            docker logout
                            echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin
                        '''
                    }

                    echo "Docker login completed"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Docker Build started..."

                bat "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."

                echo "Docker Build completed"
            }
        }

        stage('Testing') {
            steps {
                echo "Testing started..."

                // Add your actual tests here
                // Example:
                // bat 'bun test'
                // bat 'npm test'

                echo "Testing completed"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "SonarQube analysis started..."

                    withSonarQubeEnv('SonarQubeServer') {
                        bat """
                            "${SONAR_HOME}/bin/sonar-scanner" ^
                            -Dsonar.projectKey=ai-demo ^
                            -Dsonar.projectName=ai-demo ^
                            -Dsonar.sources=. ^
                            -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.git/**,**/.husky/**
                        """
                    }

                    echo "SonarQube analysis completed"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    echo "Checking SonarQube Quality Gate..."
                    timeout(time: 2, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    echo "Running Trivy security scan via Docker..."
                    bat "docker run --rm -v //var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --no-progress --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_NAME}:${IMAGE_TAG}"
                    // bat "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --no-progress --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        
        stage('OWASP Dependency Check') {
            steps {
                script {
                    echo "Running OWASP Dependency-Check security scan via Docker..."
                    // owasp_dependency();
                    // dependencyCheck additionalArguments: '--scan ./', odcInstallation: "OWASP"
                    // dependencyCheckPublisher pattern: '**/reports/dependency-check-report.xml'
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                echo "Pushing image to Docker Hub..."

                withCredentials([
                    usernamePassword(
                        credentialsId: 'DockerHub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    
                    bat "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    bat "docker push ${IMAGE_NAME}:latest"

                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying full stack with Docker Compose..."
                bat 'docker compose down --remove-orphans'
                bat 'docker compose up -d'
                bat 'docker compose ps'
            }
        }
    }

    post {
        always {
            cleanWs()
            bat "docker logout";
        }

        success {
            echo "Successfully built, pushed and deployed ${IMAGE_NAME}:${IMAGE_TAG}"

            emailext attachLog: true,
            from: 'bhavindami@gmail.com',
            to: 'jethava.bhavin@gmail.com',
            subject: 'Build #${BUILD_NUMBER} - SUCCESS',
            body: """
                <h1>Build #${BUILD_NUMBER} - SUCCESS</h1>
                <p>Successfully built, pushed and deployed ${IMAGE_NAME}:${IMAGE_TAG}</p>
            """
        }

        failure {
            echo "Pipeline failed for Build #${BUILD_NUMBER}"

            emailext attachLog: true,
            from: 'bhavindami@gmail.com',
            to: 'jethava.bhavin@gmail.com',
            subject: 'Build #${BUILD_NUMBER} - FAILURE',
            body: """
                <h1>Build #${BUILD_NUMBER} - FAILURE</h1>
                <p>Pipeline failed for Build #${BUILD_NUMBER}</p>
            """
        }
    }
}
