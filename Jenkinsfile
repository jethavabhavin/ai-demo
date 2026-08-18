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

        // ============================================================
        // 1. CHECKOUT
        // ============================================================
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


        // ============================================================
        // 2. GENERATE ENV FILES
        // ============================================================
        stage('Generate Environment Files') {
            steps {

                echo "Generating server .env file..."

                withCredentials([
                    file(credentialsId: 'ServerEnv', variable: 'ENV_FILE')
                ]) {
                    bat 'copy /Y "%ENV_FILE%" "apps\\server\\.env"'
                }

                echo "Server .env file generated"


                echo "Generating PWA .env file..."

                withCredentials([
                    file(credentialsId: 'PwaEnv', variable: 'ENV_FILE')
                ]) {
                    bat 'copy /Y "%ENV_FILE%" "apps\\pwa\\.env"'
                }

                echo "PWA .env file generated"
            }
        }


        // ============================================================
        // 3. CHECK ENVIRONMENT
        // ============================================================
        stage('Check Environment') {
            steps {

                echo "Checking Windows environment..."

                bat 'docker --version'
                bat 'docker info'
                bat 'git --version'
            }
        }


        // ============================================================
        // 4. INSTALL DEPENDENCIES / TEST
        // ============================================================
        stage('Testing') {
            steps {

                echo "Testing started..."

                // Add your actual tests here.

                // Example:
                // bat 'bun install --frozen-lockfile'
                // bat 'bun test'

                echo "Testing completed"
            }
        }


        // ============================================================
        // 5. SONARQUBE ANALYSIS
        // ============================================================
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


        // ============================================================
        // 6. SONAR QUALITY GATE
        // ============================================================
        stage('Quality Gate') {
            steps {

                script {

                    echo "Checking SonarQube Quality Gate..."

                    timeout(time: 2, unit: 'MINUTES') {

                        waitForQualityGate(
                            abortPipeline: true
                        )
                    }
                }
            }
        }


        // ============================================================
        // 7. BUILD DOCKER IMAGE
        // ============================================================
        stage('Build Docker Image') {
            steps {

                echo "Docker Build started..."

                bat """
                    docker build ^
                    -t ${IMAGE_NAME}:${IMAGE_TAG} ^
                    -t ${IMAGE_NAME}:latest .
                """

                echo "Docker Build completed"
            }
        }


        // ============================================================
        // 8. TRIVY SECURITY SCAN
        // ============================================================
        stage('Trivy Security Scan') {
            steps {

                script {

                    echo "Running Trivy security scan..."

                    bat """
                        docker run --rm ^
                        -v //var/run/docker.sock:/var/run/docker.sock ^
                        aquasec/trivy:latest image ^
                        --no-progress ^
                        --exit-code 1 ^
                        --severity HIGH,CRITICAL ^
                        ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }   


        // ============================================================
        // 9. OWASP DEPENDENCY CHECK
        // ============================================================
        stage('OWASP Dependency Check') {
            steps {

                script {

                    echo "Running OWASP Dependency Check..."

                    // Example if configured in Jenkins:
                    //
                    // dependencyCheck(
                    //     additionalArguments: '--scan ./',
                    //     odcInstallation: 'OWASP'
                    // )
                    //
                    // dependencyCheckPublisher(
                    //     pattern: '**/reports/dependency-check-report.xml'
                    // )

                    echo "OWASP Dependency Check completed"
                }
            }
        }


        // ============================================================
        // 10. DOCKER HUB LOGIN
        // ============================================================
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


        // ============================================================
        // 11. PUSH IMAGE
        // ============================================================
        stage('Push Image to Docker Hub') {
            steps {

                echo "Pushing image to Docker Hub..."

                bat "docker push ${IMAGE_NAME}:${IMAGE_TAG}"

                bat "docker push ${IMAGE_NAME}:latest"

                echo "Docker images pushed successfully"
            }
        }


        // ============================================================
        // 12. DEPLOY
        // ============================================================
        stage('Deploy') {
            steps {

                echo "Deploying application with Docker Compose..."

                bat 'docker compose down --remove-orphans'

                bat 'docker compose up -d'

                bat 'docker compose ps'
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {

        success {

            echo "Successfully built, scanned, pushed and deployed ${IMAGE_NAME}:${IMAGE_TAG}"

            emailext(
                attachLog: true,
                from: 'bhavindami@gmail.com',
                to: 'jethava.bhavin@gmail.com',
                subject: "Build #${BUILD_NUMBER} - SUCCESS",
                body: """
                    <h1>Build #${BUILD_NUMBER} - SUCCESS</h1>

                    <p>
                        Successfully built, scanned, pushed and deployed:
                    </p>

                    <p>
                        <b>${IMAGE_NAME}:${IMAGE_TAG}</b>
                    </p>

                    <p>
                        Docker Image:
                        ${IMAGE_NAME}:latest
                    </p>
                """
            )
        }


        failure {

            echo "Pipeline failed for Build #${BUILD_NUMBER}"

            emailext(
                attachLog: true,
                from: 'bhavindami@gmail.com',
                to: 'jethava.bhavin@gmail.com',
                subject: "Build #${BUILD_NUMBER} - FAILURE",
                body: """
                    <h1>Build #${BUILD_NUMBER} - FAILURE</h1>

                    <p>
                        Pipeline failed for Build #${BUILD_NUMBER}.
                    </p>

                    <p>
                        Please check the Jenkins console log.
                    </p>
                """
            )
        }


        always {

            echo "Cleaning workspace..."

            cleanWs()

            bat 'docker logout'
        }
    }
}