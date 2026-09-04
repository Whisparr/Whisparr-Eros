using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using NLog;
using NLog.Config;
using NLog.Targets;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Exceptions;
using NzbDrone.Test.Common;
using Whisparr.Http.ErrorManagement;

namespace NzbDrone.Api.Test.ErrorManagement
{
    [TestFixture]
    public class WhisparrErrorPipelineFixture : TestBase<WhisparrErrorPipeline>
    {
        private CapturingTarget _capturedLogs;
        private LoggingRule _capturingRule;

        [SetUp]
        public void Setup()
        {
            // ExceptionVerification only sees logs once another fixture has run first, so capture
            // the pipeline's own log events directly.
            _capturedLogs = new CapturingTarget();
            _capturingRule = new LoggingRule("*", LogLevel.Trace, _capturedLogs);

            var config = LogManager.Configuration;
            config.AddTarget("WhisparrErrorPipelineFixture", _capturedLogs);
            config.LoggingRules.Insert(0, _capturingRule);
            LogManager.Configuration = config;
        }

        [TearDown]
        public void TearDown()
        {
            var config = LogManager.Configuration;
            config.LoggingRules.Remove(_capturingRule);
            config.RemoveTarget("WhisparrErrorPipelineFixture");
            LogManager.Configuration = config;
        }

        private static HttpContext GetHttpContext(Exception exception)
        {
            var httpContext = new DefaultHttpContext();

            httpContext.Request.Method = "POST";
            httpContext.Request.Path = "/api/v3/movie";
            httpContext.Response.Body = new MemoryStream();
            httpContext.Features.Set<IExceptionHandlerPathFeature>(new ExceptionHandlerFeature
            {
                Error = exception,
                Path = httpContext.Request.Path
            });

            return httpContext;
        }

        private static string GetBody(HttpContext context)
        {
            context.Response.Body.Position = 0;

            using var reader = new StreamReader(context.Response.Body, Encoding.UTF8);

            return reader.ReadToEnd();
        }

        private HttpContext WhenExceptionIsHandled(Exception exception)
        {
            var context = GetHttpContext(exception);

            Subject.HandleException(context).GetAwaiter().GetResult();

            return context;
        }

        [Test]
        public void should_return_conflict_for_excluded_exception()
        {
            var context = WhenExceptionIsHandled(new ExcludedException("Studio: [Some Studio] has been excluded"));

            context.Response.StatusCode.Should().Be((int)HttpStatusCode.Conflict);
        }

        [Test]
        public void should_return_message_without_stack_trace_for_excluded_exception()
        {
            var context = WhenExceptionIsHandled(new ExcludedException("Studio: [Some Studio] has been excluded"));

            var body = GetBody(context);

            body.Should().Contain("Studio: [Some Studio] has been excluded");
            body.Should().NotContain("description");
            body.Should().NotContain("NzbDrone.Core.Exceptions.ExcludedException");
        }

        [Test]
        public void should_log_excluded_exception_below_warn()
        {
            WhenExceptionIsHandled(new ExcludedException("Studio: [Some Studio] has been excluded"));

            _capturedLogs.Events.Should().Contain(e => e.Level == LogLevel.Info);
            _capturedLogs.Events.Should().NotContain(e => e.Level >= LogLevel.Warn);
        }

        [Test]
        public void should_still_return_internal_server_error_for_unhandled_exception()
        {
            var context = WhenExceptionIsHandled(new InvalidOperationException("Something actually broke"));

            context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
            GetBody(context).Should().Contain("Something actually broke");

            _capturedLogs.Events.Should().Contain(e => e.Level == LogLevel.Fatal);

            ExceptionVerification.ExpectedFatals(1);
        }

        [Test]
        public void should_return_not_found_for_model_not_found_exception()
        {
            var context = WhenExceptionIsHandled(new ModelNotFoundException(typeof(object), 1));

            context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        }

        private sealed class CapturingTarget : Target
        {
            public List<LogEventInfo> Events { get; } = new List<LogEventInfo>();

            protected override void Write(LogEventInfo logEvent)
            {
                Events.Add(logEvent);
            }
        }
    }
}
