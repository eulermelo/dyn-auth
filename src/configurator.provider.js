(function() {
    'use strict';

    angular
        .module('dyn.auth')
        .provider('dynAuthConfig', dynAuthConfig);

    dynAuthConfig.$inject = [];

    /* @ngInject */
    function dynAuthConfig() {

        /* jshint validthis:true */
        this.config = {
            homeLocation: '/home',
            loginUrl: '/idp',
            logoutUrl: '/idp/logout',
            userInfoUrl: '/idp/auth/me'
        };

        this.$get = function() {
            return this.config;
        };
    }
})();
