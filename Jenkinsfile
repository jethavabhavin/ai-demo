pipeline {
    agent {
        label 'LocalWindows'
    }

    environment {
        IMAGE_NAME = 'bhavin42/ai-demo'
        IMAGE_TAG = "${BUILD_NUMBER}"
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
                echo "Deploying Docker container..."

                bat '''
                    docker stop ai-demo 2>NUL || exit /b 0
                    docker rm ai-demo 2>NUL || exit /b 0
                '''

                bat "docker pull ${IMAGE_NAME}:latest"

                bat '''
                    docker run -d ^
                        --name ai-demo ^
                        -p 3001:3001 ^
                        -p 5173:5173 ^
                        bhavin42/ai-demo:latest
                '''

                bat 'docker ps'
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
        }

        failure {
            echo "Pipeline failed for Build #${BUILD_NUMBER}"
        }
    }
}
