'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        watch: {
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'secure/*.html',
                    '.tmp/styles/{,*/}*.css',
                    '{.tmp,secure}/scripts/{,*/}*.js',
                    'secure/images/{,*/}*.{gif,jpeg,jpg,png,svg,webp}'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        'secure'
                    ]
                }
            },
            dist: {
                options: {
                    open: true,
                    base: 'dist',
                    livereload: false
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        'dist/secure/*',
                        '!dist/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    dest: 'dist',
                    src: 'secure/runner.js'
                }]

            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        'dist/scripts/{,*/}*.js',
                        'dist/styles/{,*/}*.css',
                        'dist/images/{,*/}*.{gif,jpeg,jpg,png,webp}',
                        'dist/styles/fonts/{,*/}*.*'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'secure',
                    dest: 'dist/secure',
                    src: [
                        'index.html'
                    ]
                }]
            }
        },
        aws: grunt.file.readJSON('aws.json'),
        s3: {
          options: {
            key: '<%= aws.key %>',
            secret: '<%= aws.secret %>',
            bucket: '<%= aws.bucket %>',
            region: '<%= aws.region %>',
            access: 'public-read',
            headers: {
              // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
              "Cache-Control": "max-age=630720000, public",
              "Expires": new Date(Date.now() + 63072000000).toUTCString()
            }
          },
          deploy: {
            // Files to be uploaded.
            upload: [
              { src: 'dist/secure/*.*', dest: '/' }
            ]
          }
        }

    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'uglify',
        'copy:dist'
//        'rev'
    ]);

    grunt.registerTask('deploy', [
        'build',
        's3'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
