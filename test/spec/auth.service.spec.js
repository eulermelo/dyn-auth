/**
 * Testes especificos para o serviço dynAuth
 */
describe('dynAuth', function() {

    var dynAuthConfig;
    var dynAuth;

    beforeEach(module('ngCookies'));
    beforeEach(module('dyn.auth'));

    beforeEach(
        inject(function(_dynAuthConfig_, _dynAuth_) {
            dynAuthConfig = _dynAuthConfig_;
            dynAuth = _dynAuth_;
        })
    );

    it('deve injetar os serviços dynAuth e dynAuthConfig', function() {
        expect(dynAuthConfig).toBeDefined();
        expect(dynAuthConfig.homeLocation).toBeDefined();

        // a propriedade config deve ser vista somente pelo Provider
        expect(dynAuthConfig.config).toBeUndefined();
        expect(dynAuthConfig.xxx).toBeUndefined();

        expect(dynAuth).toBeDefined();
        expect(dynAuth.getCurrentUser).toBeDefined();
        expect(dynAuth.currentUser).toBeUndefined();
    });
});
