(function() {
    'use strict';

    angular.module('dyn.auth')
        .factory('dynAuthInterceptor', dynAuthInterceptor)
        .config(dynAuthInterceptorConfig);

    dynAuthInterceptor.$inject = ['$window', '$q', 'dynAuthConfig', '$rootScope'];

    /* @ngInject */
    function dynAuthInterceptor($window, $q, dynAuthConfig, $rootScope) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.localStorage.token) {
                    config.headers.Authorization = $window.localStorage.token;
                }
                return config;
            },
            responseError: function (response) {
                if (response.status === 401) {
                	$rootScope.$broadcast('dynAuth.userUnauthorized', {
                         urlToRedirect: dynAuthConfig.loginUrl
                    });

                } else if (response.status === 403) {
                    $rootScope.$broadcast('dynAuth.forbbiden');

                } else if (response.status === 500) {
                    $rootScope.$broadcast('dynAuth.internalServerError');
                }
                return $q.reject(response);
            }
        };
    }

    dynAuthInterceptorConfig.$inject = ['$httpProvider'];

    /* @ngInject */
    function dynAuthInterceptorConfig ($httpProvider) {
        $httpProvider.interceptors.push('dynAuthInterceptor');
    }
})();
