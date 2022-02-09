(function () {
    'use strict';

    angular
        .module('dyn.auth')
        .directive('dynHasProfile', dynHasProfile);

    dynHasProfile.$inject = ['dynAuth'];

    /* @ngInject */
    function dynHasProfile(dynAuth) {
        return {
            restrict: 'A',
            link: dynAccessControlLink
        };

        function dynAccessControlLink(scope, element, attrs) {
            scope.currentUser = dynAuth.getCurrentUser();
            scope.$watch('currentUser', function () {
                var profiles = attrs.dynHasProfile.split(',');
                if (!dynAuth.hasSomeProfile(profiles)) {
                    element.remove();
                }
            });
        }
    }
})();