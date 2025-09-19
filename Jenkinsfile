pipeline {
    agent any
    options {
        timeout(time: 1, unit: 'HOURS')  // 1시간 timeout
    }
    environment {
        DOCKER_IMAGE_BE = "941kjw/cinemoa"  // 백엔드 이미지
        DOCKER_IMAGE_FE = "941kjw/cinemoafe"  // 프론트엔드 이미지
        DOCKER_TAG = "latest"
    }
    stages {//수정
        stage('Detect BE Branch and Build') {
            when {
                branch 'BE'  // BE 브랜치 푸시 시에만 실행
            }
            steps {
                echo 'BE 브랜치 Push가 감지되었습니다. : Docker 빌드를 시작합니다.'
                script {
                    withCredentials([
                                    file(credentialsId: 'application',variable: 'APPLICATION'),
                                    file(credentialsId: 'application-db',variable: 'APPLICATION_DB'),
                                    file(credentialsId: 'keyfile', variable: 'KEYFILE')
                                    ]) {
                        sh '''
                        cd ./backend
                        mkdir -p ./src/main/resources
                        chmod 755 ./src/main/resources
                        cp -f $APPLICATION ./src/main/resources/application.yml
                        cp -f $APPLICATION_DB ./src/main/resources/application-db.yml
                        cp -f $KEYFILE ./src/main/resources/keystore.p12
                        chmod +x ./gradlew
                        docker build -t ${DOCKER_IMAGE_BE}:${DOCKER_TAG} .
                        '''
                    }
                }
            }
            post {
                failure {
                    echo 'BE 빌드 스테이지 실패: Docker 빌드 또는 푸시에 문제가 발생했습니다. 로그를 확인하세요.'
                    sh 'echo "Error details: $BUILD_LOG"'
                }
            }
        }
        stage('Deploy BE with Compose') {
            when {
                branch 'BE'
            }
            steps {
                script {
                    sh 'docker compose -f /var/scripts/backend.yml up -d'
                }
            }
            post {
                failure {
                    echo 'BE 배포 스테이지 실패: Compose 실행에 문제가 발생했습니다. Compose 명령어를 확인하세요.'
                }
            }
        }
        stage('Detect FE Branch and Build') {
            when {
                branch 'FE'  // FE 브랜치 푸시 시에만 실행
            }
            steps {
                echo 'FE 브랜치 Push가 감지되었습니다. : Docker 빌드를 시작합니다.'
                script {
                    withCredentials([
                                    file(credentialsId: 'env',variable: 'ENV')
                                    ]) {
                        sh '''
                        cd ./frontend
                        mkdir -p ./ssl
                        cp -f $ENV ./.env
                        docker build -t ${DOCKER_IMAGE_FE}:${DOCKER_TAG} .
                        '''
                    }
                }
            }
            post {
                failure {
                    echo 'FE 빌드 스테이지 실패: Docker 빌드 또는 푸시에 문제가 발생했습니다. 로그를 확인하세요.'
                    sh 'echo "Error details: $BUILD_LOG"'
                }
            }
        }
        stage('Deploy FE with Compose') {
            when {
                branch 'FE'
            }
            steps {
                script {
                    sh 'docker compose -f /var/scripts/frontend.yml up -d'
                }
            }
            post {
                failure {
                    echo 'FE 배포 스테이지 실패: Compose 실행에 문제가 발생했습니다. Compose 명령어를 확인하세요.'
                }
            }
        }
    }
    post {
        always {
            echo '${env.BRANCH_NAME} 브랜치 대상 파이프라인 실행 완료: 상태를 확인하세요.'
        }
        failure {
            echo '전체 파이프라인 실패: 빌드 번호 ${BUILD_NUMBER}에서 오류 발생. Jenkins 콘솔 로그를 검토하세요.'
        }
        success {
            echo '파이프라인 성공: 모든 단계가 정상적으로 완료되었습니다.'
        }
    }
}
