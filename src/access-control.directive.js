(function() {
    'use strict';

    angular
        .module('dyn.auth')
        .directive('dynAccessControl', dynAccessControlDirective);

    dynAccessControlDirective.$inject = ['dynAuth'];

    /* @ngInject */
    function dynAccessControlDirective(dynAuth) {
        return {
            restrict: 'A',
            link: dynAccessControlLink
        };

        function dynAccessControlLink(scope, element, attrs) {
            scope.currentUser = dynAuth.getCurrentUser();
            scope.$watch('currentUser', function() {
                var roles = attrs.dynAccessControl.split(',');
                if (!dynAuth.hasSomeRole(roles)) {
                    element.remove();
                }
            });
        }
    }
})();
