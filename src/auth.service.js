(function() {
    'use strict';
    angular
        .module('dyn.auth')
        .factory('dynAuth', dynAuth);

    var currentUser = null;

    dynAuth.$inject = [
        '$q',
        '$window',
        '$http',
        '$location',
        '$rootScope',
        '$cookies',
        '$log',
        'dynAuthConfig',
    ];

    /**
     * Serviço de autenticação Dynamix para os sistemas da Unimed Brasil.
     *
     * @param {Object} $q               Serviço para execução de funções de modo assíncrono.
     * @param {Object} $window          Serviço que encapsula o window do JavaScript.
     * @param {Object} $http            Serviço de http do Angular.
     * @param {Object} $location        Serviço que encapsula o location do JavaScript.
     * @param {Object} $rootScope       Serviço de scopo global da aplicação.
     * @param {object} $cookies         Serviço para gerenciamento de cookies.
     * @param {Object} $log             Serviço de log.
     * @param {Object} dynAuthConfig    Configuração do módulo de autenticação.
     */
    function dynAuth(
        $q,
        $window,
        $http,
        $location,
        $rootScope,
        $cookies,
        $log,
        dynAuthConfig) {

        var AUTH_USER_CHANGED = 'dynAuth.userChanged';
        var AUTH_USER_UNAUTHORIZED = 'dynAuth.userUnauthorized';
        var AUTH_USER_LOGGED_OUT = 'dynAuth.userLoggedOut';
        var AUTH_USER_LOAD_INFO_FAILED = 'dynAuth.userLoadInfoFailed';

        return {
            // Constants
            AUTH_USER_CHANGED: AUTH_USER_CHANGED,
            AUTH_USER_UNAUTHORIZED: AUTH_USER_UNAUTHORIZED,
            AUTH_USER_LOGGED_OUT: AUTH_USER_LOGGED_OUT,
            AUTH_USER_LOAD_INFO_FAILED: AUTH_USER_LOAD_INFO_FAILED,
            // Methods
            logout: logout,
            getCurrentUser: getCurrentUser,
            isLoggedIn: isLoggedIn,
            hasRole: hasRole,
            hasSomeRole: hasSomeRole,
            getUrlLogin: getUrlLogin,
            hasValidCredentials: hasValidCredentials,
            loadUserInfos: loadUserInfos
        };

        /**
         * Efetua o logou do usuário atual.
         * @return {Object} Promise da requisição.
         */
        function logout() {
            return $http.post(dynAuthConfig.logoutUrl)
                .then(function(response) {
                    delete $window.localStorage.token;
                    delete $window.localStorage.currentUserStr;
                    $cookies.remove('Authorization');
                    currentUser = {};
                    var responseData = response.data || {
                        url: getUrlLogin()
                    };
                    broadcastChanges(AUTH_USER_LOGGED_OUT, responseData);
                    return responseData;
                });
        }

        /**
         * Informa se o usuário está autenticado ou não.
         * @return {Boolean} true caso o usuário esteja logado, false caso contrário.
         */
        function isLoggedIn() {
            var hasCredentials = checkUserCredentials();
            var emptyUser = angular.equals({}, currentUser) || !currentUser;
            return hasCredentials && !emptyUser;
        }

        /**
         * Retorna o usuário atualmente logado ou undefined caso não exista.
         * @return {Object} Usuário autenticado.
         */
        function getCurrentUser() {
            return isLoggedIn() ? currentUser : undefined;
        }

        /**
         * Retorna a URL da página de autenticação do sistema.
         * @return {String} URL da página de autenticação do sistema.
         */
        function getUrlLogin() {
            return dynAuthConfig.loginUrl || {};
        }

        /**
         * Valida se o usuário atual possui determina role.
         * @param  {String}  role Role a ser verificada.
         * @return {Boolean}      true caso o usuário tenha a role, false caso contrário.
         */
        function hasRole(role) {
            if (currentUser && !(currentUser.roles instanceof Array)) {
                return false;
            }
            return isLoggedIn() && currentUser.roles.some(function(element) {
                return element === role;
            });
        }

        /**
         * Valida se o usuário possui alguma das roles especificadas.
         * @param  {Array}      roles   Lista de roles a serem verificadas.
         * @return {Boolean}            true caso o usuário tenha ao menos uma role, false caso contrário.
         */
        function hasSomeRole(roles) {
            if (!(roles instanceof Array)) {
                $log.warn('[hasSomeRole] o parametro passado não é um Array');
                return false;
            }
            return roles.some(function(element) {
                return hasRole(element.trim());
            });
        }

        /**
         * Verifica se o usuário tem credenciais de acesso válidas.
         * @return {Object} Promise da requisição.
         */
        function hasValidCredentials() {
            var hasValidCredentials = checkUserCredentials();
            return $q(function(resolve, reject) {
                if (hasValidCredentials) {
                    resolve(getUrlToRedirect(dynAuthConfig.homeLocation));
                }
                reject(getUrlToRedirect(dynAuthConfig.loginUrl));
            });
        }

        /**
         *  Verifica token, cookies, e outras informações.
         *  @return {Boolean} true caso sejam válidas, false caso contrário.
         */
        function checkUserCredentials() {

            var currentUserStr = $window.localStorage.currentUserStr;
            var token = $window.localStorage.token;
            var cookieToken = angular.copy($cookies.get('Authorization'));

            if (currentUserStr && token && token === cookieToken) {
                currentUser = JSON.parse(currentUserStr);
                return true;
            }

            if (!cookieToken) {
                return false;
            }

            $window.localStorage.token = cookieToken;
            return true;
        }

        /**
         * Carrega as informações do usuário logado.
         * @return {Object} Promise da requisição.
         */
        function loadUserInfos() {
            if (!$window.localStorage.token) {
                return $q(function(resolve, reject) {
                    reject(getUrlToRedirect(dynAuthConfig.loginUrl));
                });
            }
            return $http.get(dynAuthConfig.userInfoUrl)
                .then(function(response) {
                    currentUser = response.data || {};
                    $window.localStorage.currentUserStr = JSON.stringify(currentUser);
                    broadcastChanges(AUTH_USER_CHANGED);
                    return getUrlToRedirect(dynAuthConfig.homeLocation);
                })
                .catch(function(error) {
                    broadcastChanges(AUTH_USER_LOAD_INFO_FAILED);
                    return AUTH_USER_LOAD_INFO_FAILED;
                });
        }

        /**
         * Redireciona o usuário para alguma módulo especifico de acordo com determinada url.
         * @param  {Object}     user    Usuário autenticado.
         * @param  {Boolean}    force   Força algo :)
         */
        function changeLocationByUser(user, force) {
            if (!force && $location.path() && $location.path() !== '/') {
                return;
            }
            var path = user.defaultPath;
            if (!path) {
                path = dynAuthConfig.homeLocation;
            }
            $location.path(path);
        }

        /**
         * Envia notificações para o sistema de alteração do usuário autenticado.
         * @param  {String} key    Tópico referente ao assunto da notificação
         * @param  {Object} params Dados referentes a notificação
         */
        function broadcastChanges(key, params) {
            $rootScope.$broadcast(key, params);
        }

        /**
         * Função auxiliar que retorna o objeto de redirect para uma URL especifica.
         * @return {Object} Objeto contendo a propriedade urlToRedirect.
         */
        function getUrlToRedirect(url) {
            return {
                urlToRedirect: url
            };
        }
    }
})();
